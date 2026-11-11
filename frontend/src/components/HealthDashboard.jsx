import { useMemo, useState } from 'react'
import RangeBar from './RangeBar.jsx'
import { STATUS_LABELS, sortByConcern } from '../utils/format.js'

const FILTERS = ['all', 'normal', 'low', 'high', 'borderline', 'unknown']

/**
 * Feature F3: every result plotted against its lab reference range, with status
 * filter chips and a choice of order (out-of-range first, or as printed and grouped
 * by section). Pure rendering of the analyze response — no extra API call.
 *
 * @param {{ report: object, onOpen: (test: object) => void }} props
 */
export default function HealthDashboard({ report, onOpen }) {
  const [filter, setFilter] = useState('all')
  const [order, setOrder] = useState('concern') // 'concern' | 'report'
  const counts = report.summary.counts

  const groups = useMemo(() => {
    const visible = report.tests.filter((t) => filter === 'all' || t.status === filter)
    if (order === 'concern') return [['Out-of-range results first', sortByConcern(visible)]]
    const map = new Map()
    for (const t of visible) {
      const key = t.category || 'Other results'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(t)
    }
    return [...map.entries()]
  }, [report.tests, filter, order])

  return (
    <section className="card" aria-labelledby="dash-title">
      <h1 id="dash-title">Health dashboard</h1>
      <p className="muted">
        Each bar shows the lab&apos;s reference range (green band) and where your result falls
        (marker). Ranges come from your lab and can differ between labs. Select a result for
        details.
      </p>

      <div className="dash-controls">
        <div className="filter-chips" role="group" aria-label="Filter results by status">
          {FILTERS.map((f) => {
            const n = f === 'all' ? counts.total : counts[f]
            if (f !== 'all' && !n) return null
            return (
              <button
                key={f}
                type="button"
                className={`filter-chip filter-chip--${f}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : STATUS_LABELS[f]} ({n})
              </button>
            )
          })}
        </div>
        <div className="segmented" role="group" aria-label="Order results">
          <button
            type="button"
            aria-pressed={order === 'concern'}
            onClick={() => setOrder('concern')}
          >
            Out of range first
          </button>
          <button
            type="button"
            aria-pressed={order === 'report'}
            onClick={() => setOrder('report')}
          >
            By section
          </button>
        </div>
      </div>

      {groups.every(([, tests]) => tests.length === 0) && (
        <p className="muted">No results match this filter.</p>
      )}
      {groups.map(([category, tests]) =>
        tests.length ? (
          <div key={category} className="dash-group">
            {order === 'report' && <h2>{category}</h2>}
            {tests.map((t) => (
              <RangeBar key={t.id} test={t} onOpen={onOpen} />
            ))}
          </div>
        ) : null,
      )}
    </section>
  )
}
