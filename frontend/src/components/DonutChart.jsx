import { STATUS_LABELS } from '../utils/format.js'

const ORDER = ['normal', 'borderline', 'low', 'high', 'unknown']
const COLORS = {
  normal: 'var(--color-normal)',
  borderline: '#a8961d',
  low: '#c98a1c',
  high: 'var(--color-high)',
  unknown: '#9aaba8',
}

/**
 * Donut chart of result counts by status, with "7 of 9 in range" in the middle.
 * Plain SVG: each status is one circle segment drawn with stroke-dasharray.
 *
 * @param {{ counts: {total:number, normal:number, low:number, high:number,
 *                    borderline:number, unknown:number} }} props
 */
export default function DonutChart({ counts }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const gap = counts.total > 1 ? 2 : 0 // small gap between segments
  let offset = 0
  const segments = ORDER.filter((s) => counts[s] > 0).map((s) => {
    const length = (counts[s] / counts.total) * circumference
    const seg = { status: s, length: Math.max(length - gap, 0.5), offset }
    offset += length
    return seg
  })
  const label =
    `${counts.normal} of ${counts.total} results in range. ` +
    segments.map((s) => `${counts[s.status]} ${STATUS_LABELS[s.status].toLowerCase()}`).join(', ')

  return (
    <figure className="donut" role="img" aria-label={label}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--mist)" strokeWidth="11" />
        {segments.map((s) => (
          <circle
            key={s.status}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={COLORS[s.status]}
            strokeWidth="11"
            strokeDasharray={`${s.length} ${circumference - s.length}`}
            strokeDashoffset={-s.offset}
            transform="rotate(-90 50 50)"
          />
        ))}
      </svg>
      <figcaption className="donut__center" aria-hidden="true">
        <span className="donut__big">
          {counts.normal}
          <span className="donut__of"> of {counts.total}</span>
        </span>
        <span className="donut__small">in range</span>
      </figcaption>
    </figure>
  )
}
