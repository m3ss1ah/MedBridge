import { Languages } from 'lucide-react'
import DonutChart from './DonutChart.jsx'
import GlossaryText from './GlossaryText.jsx'
import ReadAloud from './ReadAloud.jsx'
import { STATUS_LABELS } from '../utils/format.js'
import { LANGUAGES } from '../utils/constants.js'

const ORDER = ['normal', 'borderline', 'low', 'high', 'unknown']

/**
 * The top of the report: report type and lab details, a donut of results in range,
 * the plain-language overview with glossary tooltips, key findings, a language
 * switch (English / Hindi) and a "Listen" button that reads the summary aloud.
 *
 * @param {{ report: object, language: string, onLanguage: (lang: string) => void,
 *           translating: boolean, translateError?: string }} props
 */
export default function ReportSummary({
  report,
  language,
  onLanguage,
  translating,
  translateError,
}) {
  const { summary, patient_context: pc, report_type: reportType } = report
  const counts = summary.counts
  const details = [
    ['Lab', pc.lab_name],
    ['Date', pc.report_date],
    ['Age', pc.age],
    ['Sex', pc.sex],
  ].filter(([, v]) => v)
  const segments = ORDER.filter((s) => counts[s] > 0)
  const outside = counts.low + counts.high + counts.borderline
  const spoken = [summary.overview, ...summary.key_findings].join(' ')

  return (
    <section className="summary print-keep" aria-labelledby="summary-title">
      <div className="summary__top">
        <div>
          <h1 id="summary-title" className="summary__title">
            {reportType}
          </h1>
          {details.length > 0 && (
            <dl className="summary__details">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="summary__tools no-print">
          <div className="segmented" role="group" aria-label="Language of the explanation">
            <Languages size={16} aria-hidden="true" className="segmented__icon" />
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                type="button"
                lang={l.id}
                aria-pressed={language === l.id}
                disabled={translating}
                onClick={() => onLanguage(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <ReadAloud key={language} text={spoken} lang={language} />
        </div>
      </div>

      {translating && (
        <p className="summary__status" role="status">
          Writing the explanation in Hindi… this takes a few seconds the first time.
        </p>
      )}
      {translateError && (
        <p className="field-error" role="alert">
          {translateError}
        </p>
      )}

      <div className="summary__grid">
        <DonutChart counts={counts} />
        <div className="summary__counts">
          <p className="proportion__lede">
            {outside === 0
              ? `All ${counts.total} results are inside the lab's ranges.`
              : `${outside} of ${counts.total} results sit outside the lab's ranges.`}
          </p>
          <ul className="proportion__legend" aria-label="Result counts">
            {segments.map((s) => (
              <li key={s}>
                <span className={`dot dot--${s}`} aria-hidden="true" />
                <strong>{counts[s]}</strong> {STATUS_LABELS[s].toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="summary__body" lang={report.language ?? 'en'}>
        <p className="summary__overview">
          <GlossaryText text={summary.overview} />
        </p>
        {summary.key_findings.length > 0 && (
          <>
            <h2>What stands out</h2>
            <ul className="findings">
              {summary.key_findings.map((k, i) => (
                <li key={i}>
                  <GlossaryText text={k} />
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="small muted no-print">
          Underlined words have a short explanation. Hover over them or move to them with Tab.
        </p>
      </div>
    </section>
  )
}
