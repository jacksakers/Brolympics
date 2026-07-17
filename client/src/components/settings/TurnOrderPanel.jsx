import { useState } from 'react'
import { generateTurnOrder } from '../../utils/generateTurnOrder.js'

/**
 * Generates and displays a random turn order for a game, drawn from
 * either teams or players depending on the game's format. Turn order is
 * a UI convenience only — it isn't persisted (no such field in the
 * schema per docs/SDD.md §4.3).
 *
 * @param {{entrants: Array<{id: number, name: string}>}} props
 */
export default function TurnOrderPanel({ entrants }) {
  const [order, setOrder] = useState(null)

  function handleGenerate() {
    setOrder(generateTurnOrder(entrants))
  }

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={entrants.length === 0}
        className="min-h-11 rounded-lg border border-purple-600 px-4 text-sm font-semibold text-purple-600 disabled:opacity-50 dark:text-purple-400"
      >
        Generate Turn Order
      </button>

      {order && (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-900 dark:text-white">
          {order.map((entrant) => (
            <li key={entrant.id}>{entrant.name}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
