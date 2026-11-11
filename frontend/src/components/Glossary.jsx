import { useMemo, useState } from 'react'
import { Search, MessageCircleQuestion } from 'lucide-react'
import { GLOSSARY } from '../utils/glossary.js'

const CATEGORY_ORDER = [...new Set(GLOSSARY.map((e) => e.category))]

/**
 * Searchable glossary of lab-report terms, grouped by topic. Each entry can be sent
 * to the knowledge assistant with one click for a fuller, sourced answer.
 *
 * @param {{ onAsk: (question: string) => void, reportTerms?: Set<string> }} props
 */
export default function Glossary({ onAsk, reportTerms }) {
  const [query, setQuery] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = GLOSSARY.filter((e) => {
      if (onlyMine && !reportTerms?.has(e.term)) return false
      if (!q) return true
      return [e.term, ...e.aliases, e.definition].some((s) => s.toLowerCase().includes(q))
    }).sort((a, b) => a.term.localeCompare(b.term))
    const map = new Map()
    for (const e of filtered) {
      if (!map.has(e.category)) map.set(e.category, [])
      map.get(e.category).push(e)
    }
    // Keep topics in the order they are defined (General, Blood count, Cholesterol, ...).
    return [...map.entries()].sort(
      ([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
    )
  }, [query, onlyMine, reportTerms])

  const total = groups.reduce((n, [, items]) => n + items.length, 0)

  return (
    <section className="card glossary" aria-labelledby="glossary-title">
      <div className="section-header">
        <h1 id="glossary-title">Glossary</h1>
        {reportTerms?.size > 0 && (
          <label className="toggle">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
            />
            <span>Only terms in my report</span>
          </label>
        )}
      </div>
      <p className="muted small">
        Plain-language meanings of words you will see on lab reports. The same definitions appear
        when you hover over or tab to an underlined word in your summary.
      </p>

      <div className="search-field">
        <Search size={18} aria-hidden="true" />
        <label htmlFor="glossary-search" className="visually-hidden">
          Search the glossary
        </label>
        <input
          id="glossary-search"
          type="search"
          placeholder="Search, e.g. platelets, LDL, eGFR"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <p className="small muted" aria-live="polite">
        {total === 0 ? `No terms match "${query}".` : `${total} terms`}
      </p>

      {groups.map(([category, items]) => (
        <div key={category} className="glossary__group">
          <h2>{category}</h2>
          <dl>
            {items.map((e) => (
              <div key={e.term} className="glossary__entry">
                <dt>
                  {e.term}
                  {e.aliases.length > 0 && (
                    <span className="glossary__aliases">
                      also {e.aliases.slice(0, 3).join(', ')}
                    </span>
                  )}
                </dt>
                <dd>
                  {e.definition}
                  <button
                    type="button"
                    className="link-button glossary__ask"
                    onClick={() => onAsk(`What is ${e.term}?`)}
                  >
                    <MessageCircleQuestion size={15} aria-hidden="true" /> Ask about {e.term}
                  </button>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  )
}
