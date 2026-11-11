import { useState } from 'react'
import { Copy, Printer, Check, Download, X } from 'lucide-react'
import { buildVisitSummary } from '../utils/visitSummary.js'

/**
 * Checklist of questions to take to the doctor: the AI-suggested ones plus any the
 * person added from a result's detail drawer. "Copy all", "Print" (prints only the
 * summary, questions and disclaimer) and "Download summary" (a plain-text visit note).
 *
 * @param {{ report: object, added: string[], onRemove: (q: string) => void }} props
 */
export default function DoctorQuestions({ report, added, onRemove }) {
  const questions = [...report.doctor_questions, ...added]
  const [checked, setChecked] = useState(() => new Set())
  const [copied, setCopied] = useState(false)

  async function copyAll() {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function download() {
    const blob = new Blob([buildVisitSummary(report, questions)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'medbridge-visit-summary.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function toggle(q) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(q) ? next.delete(q) : next.add(q)
      return next
    })
  }

  return (
    <section className="card doctor-questions print-keep" aria-labelledby="dq-title">
      <div className="section-header">
        <h2 id="dq-title">Questions to ask your doctor</h2>
        <div className="button-row no-print">
          <button type="button" className="btn btn--secondary btn--small" onClick={copyAll}>
            {copied ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy all'}
          </button>
          <button type="button" className="btn btn--secondary btn--small" onClick={download}>
            <Download size={16} aria-hidden="true" /> Download summary
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--small"
            onClick={() => window.print()}
          >
            <Printer size={16} aria-hidden="true" /> Print
          </button>
        </div>
      </div>
      <ul className="checklist">
        {questions.map((q, i) => {
          const isAdded = i >= report.doctor_questions.length
          return (
            <li key={q}>
              <label>
                <input type="checkbox" checked={checked.has(q)} onChange={() => toggle(q)} />
                <span>{q}</span>
              </label>
              {isAdded && (
                <button
                  type="button"
                  className="icon-button checklist__remove no-print"
                  onClick={() => onRemove(q)}
                  aria-label={`Remove question: ${q}`}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {added.length === 0 && (
        <p className="small muted no-print">
          Tip: open any result to add questions about it from the MedBridge library.
        </p>
      )}
      <span className="visually-hidden" aria-live="polite">
        {copied ? 'Questions copied to clipboard' : ''}
      </span>
    </section>
  )
}
