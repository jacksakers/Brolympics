import { useState } from 'react'

/**
 * Score entry form for a single game: lists the relevant entrants (teams
 * or players, per the game's format) with a point input each, submitting
 * a transaction per entrant that enters a non-zero value. See
 * docs/SDD.md §4.2 "Games" and docs/implementation_plan.md Phase 5.
 *
 * @param {{
 *   game: {id: number, name: string, format: 'team'|'individual'},
 *   entrants: Array<{id: number, name: string}>,
 *   onSubmitScores: (scores: Array<{entrantId: number, points: number}>) => Promise<void>,
 * }} props
 */
export default function GameScoreForm({ game, entrants, onSubmitScores }) {
  const [points, setPoints] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handlePointsChange(entrantId, value) {
    setPoints((prev) => ({ ...prev, [entrantId]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const scores = Object.entries(points)
      .map(([entrantId, value]) => ({
        entrantId: Number(entrantId),
        points: Number(value),
      }))
      .filter((s) => Number.isFinite(s.points) && s.points !== 0)

    if (scores.length === 0) return

    setIsSubmitting(true)
    try {
      await onSubmitScores(scores)
      setPoints({})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        Enter scores for {game.name}
      </h3>

      {entrants.length === 0 && (
        <p className="text-sm text-gray-400">
          No {game.format === 'team' ? 'teams' : 'players'} to score yet.
        </p>
      )}

      <ul className="space-y-2">
        {entrants.map((entrant) => (
          <li key={entrant.id} className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-900 dark:text-white">
              {entrant.name}
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={points[entrant.id] ?? ''}
              onChange={(e) => handlePointsChange(entrant.id, e.target.value)}
              placeholder="0"
              className="min-h-11 w-24 rounded-lg border border-gray-300 p-2 text-right text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </li>
        ))}
      </ul>

      {entrants.length > 0 && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 w-full rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save Scores
        </button>
      )}
    </form>
  )
}
