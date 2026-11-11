import { ChevronRight } from 'lucide-react'
import StatusChip from './StatusChip.jsx'
import { formatValue } from '../utils/format.js'

/**
 * One result row on the Report tab. Shows the name, value, status and a one-line
 * preview of what the result means; clicking opens the detail drawer.
 * @param {{ test: object, onOpen: (test: object) => void }} props
 */
export default function TestExplanationCard({ test, onOpen }) {
  const preview = test.explanation?.what_your_result_means
  return (
    <article className={`test-card test-card--${test.status}`}>
      <button
        type="button"
        className="test-card__header"
        aria-haspopup="dialog"
        onClick={() => onOpen(test)}
      >
        <span className="test-card__main">
          <span className="test-card__name">{test.name}</span>
          {preview && <span className="test-card__preview">{preview}</span>}
        </span>
        <span className="test-card__value">{formatValue(test)}</span>
        <StatusChip status={test.status} />
        <ChevronRight aria-hidden="true" size={18} className="chevron" />
      </button>
    </article>
  )
}
