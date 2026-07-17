import { useState } from 'react'
import { useEvent } from '../context/EventContext.jsx'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { useTransactions } from '../hooks/useTransactions.js'

/**
 * Bonus Points tab: quick-action form to award (or dock) arbitrary points
 * to a player or team with a reason, e.g. "Drank a beer - +10 pts". See
 * docs/SDD.md §4.2 and docs/implementation_plan.md Phase 5.
 */
export default function BonusPage() {
  const { event } = useEvent()
  const { teams } = useTeams(event.id)
  const { players } = usePlayers(event.id)
  const { addTransaction, error } = useTransactions(event.id)

  const hasTeams = teams.length > 0
  const [entrantType, setEntrantType] = useState('player')
  const [entrantId, setEntrantId] = useState('')
  const [pointsValue, setPointsValue] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const entrants = entrantType === 'team' ? teams : players

  async function handleSubmit(e) {
    e.preventDefault()
    const points = Number(pointsValue)
    if (!entrantId || !Number.isFinite(points) || points === 0 || !reason.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await addTransaction({
        [entrantType === 'team' ? 'team_id' : 'player_id']: Number(entrantId),
        points,
        reason: reason.trim(),
      })
      setEntrantId('')
      setPointsValue('')
      setReason('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        Bonus Points
      </h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        {hasTeams && (
          <div className="flex gap-2">
            {['player', 'team'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setEntrantType(type)
                  setEntrantId('')
                }}
                className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-semibold capitalize ${
                  entrantType === type
                    ? 'border-purple-600 bg-purple-600 text-white'
                    : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        <select
          value={entrantId}
          onChange={(e) => setEntrantId(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">
            Select {entrantType === 'team' ? 'a team' : 'a player'}…
          </option>
          {entrants.map((entrant) => (
            <option key={entrant.id} value={entrant.id}>
              {entrant.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          inputMode="numeric"
          value={pointsValue}
          onChange={(e) => setPointsValue(e.target.value)}
          placeholder="Points (e.g. 10 or -5)"
          className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (e.g. Drank a beer)"
          className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        <button
          type="submit"
          disabled={isSubmitting || !entrantId || !pointsValue || !reason.trim()}
          className="min-h-11 w-full rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Award Points
        </button>
      </form>
    </section>
  )
}
