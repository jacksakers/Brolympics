import { useState } from 'react'
import { generateTurnOrder } from '../../utils/generateTurnOrder.js'
import { Shuffle } from 'lucide-react'

export default function TurnOrderPanel({ entrants }) {
  const [order, setOrder] = useState(null)

  return (
    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3">
      <button
        type="button"
        onClick={() => setOrder(generateTurnOrder(entrants))}
        disabled={entrants.length === 0}
        className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--accent)]/50 px-4 text-sm font-semibold text-[var(--accent)] disabled:opacity-50 hover:bg-[var(--accent-dim)] transition-colors"
      >
        <Shuffle size={14} /> Generate Turn Order
      </button>

      {order && (
        <ol className="space-y-1 pl-1">
          {order.map((entrant, i) => (
            <li key={entrant.id} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className="w-5 text-center text-xs font-bold text-[var(--text-muted)]">{i + 1}</span>
              {entrant.name}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
