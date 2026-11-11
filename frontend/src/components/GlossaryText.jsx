import { Fragment, useId } from 'react'
import { TERM_REGEX, findEntry } from '../utils/glossary.js'

/**
 * One highlighted medical word with a plain-language tooltip.
 * The tooltip opens on hover AND on keyboard focus, and is linked with
 * aria-describedby so screen readers announce the definition too.
 */
function Term({ word, entry }) {
  const id = useId()
  return (
    <span className="term">
      <button type="button" className="term__word" aria-describedby={id}>
        {word}
      </button>
      <span role="tooltip" id={id} className="term__tip">
        <strong>{entry.term}</strong>
        {entry.definition}
      </span>
    </span>
  )
}

/**
 * Renders text with glossary terms highlighted. Only the FIRST mention of each
 * term in a block is highlighted, so paragraphs don't turn into a sea of underlines.
 *
 * @param {{ text: string }} props
 */
export default function GlossaryText({ text }) {
  if (!text) return null
  const seen = new Set()
  const parts = []
  let last = 0
  for (const match of text.matchAll(TERM_REGEX)) {
    const entry = findEntry(match[0])
    if (!entry || seen.has(entry.term)) continue
    seen.add(entry.term)
    parts.push(text.slice(last, match.index))
    parts.push(<Term key={match.index} word={match[0]} entry={entry} />)
    last = match.index + match[0].length
  }
  parts.push(text.slice(last))
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)
}
