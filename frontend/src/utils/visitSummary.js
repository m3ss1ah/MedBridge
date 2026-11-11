import { STATUS_LABELS, formatValue, sortByConcern } from './format.js'

/**
 * Plain-text "doctor visit summary" built entirely in the browser from the
 * analyze response. Nothing is sent anywhere; the person saves the file themselves.
 *
 * @param {object} report  AnalyzeReportResponse
 * @param {string[]} questions  questions to include
 * @returns {string}
 */
export function buildVisitSummary(report, questions) {
  const pc = report.patient_context
  const lines = [
    `MedBridge visit summary — ${report.report_type}`,
    [pc.lab_name && `Lab: ${pc.lab_name}`, pc.report_date && `Report date: ${pc.report_date}`]
      .filter(Boolean)
      .join('   '),
    '',
    'OVERVIEW',
    report.summary.overview,
    '',
    'RESULTS (out of range first)',
    ...sortByConcern(report.tests).map((t) => {
      const range = t.reference_range_raw ? ` (lab range: ${t.reference_range_raw})` : ''
      return `- ${t.name}: ${formatValue(t)}${range} — ${STATUS_LABELS[t.status]}`
    }),
    '',
    'QUESTIONS FOR MY DOCTOR',
    ...questions.map((q, i) => `${i + 1}. ${q}`),
    '',
    report.disclaimer,
  ]
  return lines.filter((l, i) => l !== '' || lines[i - 1] !== '').join('\n')
}
