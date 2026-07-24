import { generateTurnOrder } from '../../utils/generateTurnOrder.js'
import { Shuffle } from 'lucide-react'

/**
 * Generates a random turn order for a game and persists it (as an
 * ordered list of team/player ids on the game record) so it's shared
 * across every device and shown on the Games tab, per docs/new_features.txt.
 *
 * @param {{game: object, entrants: Array, onSave: (entrantIds: number[]) => void}} props
 */
export default function TurnOrderPanel({ game, entrants, onSave }) {
  const order = Array.isArray(game.turn_order)
    ? game.turn_order.map((id) => entrants.find((e) => e.id === id)).filter(Boolean)
    : null

  function handleGenerate() {
    onSave(generateTurnOrder(entrants).map((e) => e.id))
  }

  return (
    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={entrants.length === 0}
        className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--accent)]/50 px-4 text-sm font-semibold text-[var(--accent)] disabled:opacity-50 hover:bg-[var(--accent-dim)] transition-colors"
      >
        <Shuffle size={14} /> Generate Turn Order
      </button>

      {order && order.length > 0 && (
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

