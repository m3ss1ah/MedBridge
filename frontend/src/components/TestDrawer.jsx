import { useEffect, useRef } from 'react'
import { X, ExternalLink, MessageCircleQuestion, Plus, Check } from 'lucide-react'
import StatusChip from './StatusChip.jsx'
import RangeGauge from './RangeGauge.jsx'
import GlossaryText from './GlossaryText.jsx'
import { STATUS_PHRASES, formatValue } from '../utils/format.js'
import { computeBarGeometry } from '../utils/rangeGeometry.js'
import { askQuestionFor } from '../utils/chat.js'

/**
 * Click-through detail drawer for one test: the gauge, the plain-language
 * explanation, related knowledge-base passages (with sources) and questions for
 * the doctor that can be added to the report's question list.
 *
 * Accessible dialog: Escape closes it, focus moves into it on open and returns to
 * the element that opened it on close, and Tab stays inside while it is open.
 *
 * @param {{ test: object, onClose: () => void, onAsk: (q: string) => void,
 *           onAddQuestion: (q: string) => void, addedQuestions: Set<string> }} props
 */
export default function TestDrawer({ test, onClose, onAsk, onAddQuestion, addedQuestions }) {
  const panelRef = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    panelRef.current?.querySelector('button')?.focus()

    function onKey(event) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll('button, a[href]')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
      opener?.focus?.()
    }
  }, [onClose])

  const e = test.explanation
  const related = test.related
  const drawable = computeBarGeometry(test.value, test.ref_low, test.ref_high) !== null
  const questions = related?.doctor_questions ?? []

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        ref={panelRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onClick={(ev) => ev.stopPropagation()}
      >
        <header className="drawer__head">
          <button
            type="button"
            className="drawer__close"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={20} aria-hidden="true" />
          </button>
          {test.category && <p className="drawer__category">{test.category}</p>}
          <h2 id="drawer-title">{test.name}</h2>
          <div className="drawer__value">
            <span>{formatValue(test)}</span>
            <StatusChip status={test.status} />
          </div>
        </header>

        <div className="drawer__body">
          {drawable ? (
            <RangeGauge
              value={test.value}
              low={test.ref_low}
              high={test.ref_high}
              status={test.status}
              label={`${test.name} ${formatValue(test)}, ${STATUS_PHRASES[test.status]}`}
            />
          ) : (
            <p className="range-row__caption range-row__caption--none">
              Range couldn&apos;t be displayed — see your report.
            </p>
          )}
          {test.reference_range_raw && (
            <p className="small muted">
              Lab reference range: {test.reference_range_raw}
              {test.lab_flag ? `. The lab marked it "${test.lab_flag}".` : ''}
            </p>
          )}

          {e && (
            <section className="drawer__section">
              <h3>What it measures</h3>
              <p>
                <GlossaryText text={e.what_it_measures} />
              </p>
              <h3>What your result means</h3>
              <p>
                <GlossaryText text={e.what_your_result_means} />
              </p>
              {e.common_reasons && (
                <>
                  <h3>Why it might be {test.status === 'borderline' ? 'borderline' : 'flagged'}</h3>
                  <p>
                    <GlossaryText text={e.common_reasons} />
                  </p>
                </>
              )}
              {e.range_note && <p className="small muted">{e.range_note}</p>}
            </section>
          )}

          {related?.passages?.length > 0 && (
            <section className="drawer__section">
              <h3>From the MedBridge library</h3>
              <ul className="passage-list">
                {related.passages.map((p) => (
                  <li key={p.id} className="passage">
                    <p className="passage__section">{p.section}</p>
                    <p className="passage__text">{p.snippet}</p>
                    {p.source_url ? (
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="small"
                      >
                        {p.source_name} <ExternalLink size={13} aria-hidden="true" />
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <span className="small muted">{p.source_name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {questions.length > 0 && (
            <section className="drawer__section">
              <h3>Questions about this result</h3>
              <ul className="drawer__questions">
                {questions.map((q) => {
                  const added = addedQuestions.has(q)
                  return (
                    <li key={q}>
                      <span>{q}</span>
                      <button
                        type="button"
                        className="btn btn--secondary btn--small"
                        onClick={() => onAddQuestion(q)}
                        disabled={added}
                        aria-label={added ? `Added: ${q}` : `Add to my questions: ${q}`}
                      >
                        {added ? (
                          <Check size={15} aria-hidden="true" />
                        ) : (
                          <Plus size={15} aria-hidden="true" />
                        )}
                        {added ? 'Added' : 'Add'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>

        <footer className="drawer__foot">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onAsk(askQuestionFor(test))}
          >
            <MessageCircleQuestion size={16} aria-hidden="true" /> {askQuestionFor(test)}
          </button>
        </footer>
      </aside>
    </div>
  )
}
