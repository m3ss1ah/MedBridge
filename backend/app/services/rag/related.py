"""[Extension] Attach knowledge-base passages and doctor questions to each lab test.

This powers the frontend's click-through detail drawer. It uses retrieval only —
no LLM call — so it is fast, free and fully deterministic:

1. Search the index with the test name to find the best-matching KB document.
2. From that document take the "What it measures" section, plus the section that
   matches the result's direction ("What low/high values can be associated with").
3. Take the bullet points from its "Questions you might ask your doctor" section.

If the index is not loaded, tests simply get no related knowledge (`related=None`),
so /api/analyze-report still works without the index (spec §8.1).
"""

import logging

from app.schemas import LabTest, RelatedKnowledge, Source
from app.services.rag.index_store import IndexStore
from app.services.rag.index_store import store as default_store
from app.services.rag.retriever import retrieve

logger = logging.getLogger("medbridge.related")

# A test name is a short query, so it needs a slightly stricter match than a question.
MIN_MATCH_SCORE = 0.40
SNIPPET_CHARS = 420

MEASURES_SECTION = "What it measures"
QUESTIONS_SECTION = "Questions you might ask your doctor"
DIRECTION_SECTION = {
    "low": "What low values can be associated with",
    "high": "What high values can be associated with",
    "borderline": "What high values can be associated with",
}


def attach_related_knowledge(tests: list[LabTest], store: IndexStore | None = None) -> None:
    """Fill `test.related` in place for every test that matches a KB document."""
    store = store or default_store
    if not store.ready:
        return
    for test in tests:
        try:
            test.related = related_for_test(test, store)
        except Exception:  # never let an optional extra break the main analysis
            logger.warning("Could not attach related knowledge for one test")


def related_for_test(test: LabTest, store: IndexStore) -> RelatedKnowledge | None:
    hits = retrieve(test.name, store=store, top_k=1, min_score=MIN_MATCH_SCORE)
    if not hits:
        return None
    best = hits[0]
    slug = best.chunk["doc_slug"]
    doc_chunks = [c for c in store.chunks if c["doc_slug"] == slug]

    wanted = [MEASURES_SECTION]
    if test.status in DIRECTION_SECTION:
        wanted.append(DIRECTION_SECTION[test.status])

    passages: list[Source] = []
    for section in wanted:
        chunk = next((c for c in doc_chunks if c["section"] == section), None)
        if chunk:
            passages.append(_to_source(len(passages) + 1, chunk, best.score))
    if not passages:  # documents without the standard sections: use the matched chunk
        passages.append(_to_source(1, best.chunk, best.score))

    questions_chunk = next((c for c in doc_chunks if c["section"] == QUESTIONS_SECTION), None)
    questions = _bullets(questions_chunk["text"]) if questions_chunk else []
    return RelatedKnowledge(passages=passages, doctor_questions=questions)


def _to_source(n: int, chunk: dict, score: float) -> Source:
    text = " ".join(chunk["text"].split())
    if len(text) > SNIPPET_CHARS:
        text = text[:SNIPPET_CHARS].rsplit(" ", 1)[0] + "…"
    return Source(
        id=n,
        title=chunk["title"],
        section=chunk.get("section"),
        source_name=chunk["source_name"],
        source_url=chunk.get("source_url"),
        snippet=text,
        score=round(score, 3),
    )


def _bullets(text: str) -> list[str]:
    """Markdown '- item' lines → list of strings."""
    return [ln.strip()[2:].strip() for ln in text.splitlines() if ln.strip().startswith("- ")]
