import { useState } from 'react'
import { useEvent } from '../context/EventContext.jsx'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { useTransactions } from '../hooks/useTransactions.js'
import {
  calculatePlayerTotals,
  calculateTeamTotals,
} from '../utils/calculateScores.js'

const MEDALS = ['🥇', '🥈', '🥉']

/**
 * Leaderboard tab: dynamically ranks teams and/or players from the
 * transactions table. See docs/SDD.md §4.2 and
 * docs/implementation_plan.md Phase 5.
 */
export default function LeaderboardPage() {
  const { event } = useEvent()
  const { teams, isLoading: teamsLoading } = useTeams(event.id)
  const { players, isLoading: playersLoading } = usePlayers(event.id)
  const { transactions, isLoading: txLoading, error } = useTransactions(
    event.id,
  )
  const [view, setView] = useState('teams')

  const isLoading = teamsLoading || playersLoading || txLoading
  const hasTeams = teams.length > 0
  const activeView = hasTeams ? view : 'players'

  const rankings =
    activeView === 'teams'
      ? calculateTeamTotals(transactions, teams, players)
      : calculatePlayerTotals(transactions, players)

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        Leaderboard
      </h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {hasTeams && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('teams')}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-semibold ${
              activeView === 'teams'
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'
            }`}
          >
            Teams
          </button>
          <button
            type="button"
            onClick={() => setView('players')}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-semibold ${
              activeView === 'players'
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'
            }`}
          >
            Individuals
          </button>
        </div>
      )}

      {!isLoading && rankings.length === 0 && (
        <p className="text-sm text-gray-400">No scores yet.</p>
      )}

      <ol className="space-y-2">
        {rankings.map((entrant, index) => (
          <li
            key={entrant.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <span className="w-6 text-center">
                {MEDALS[index] ?? index + 1}
              </span>
              {entrant.name}
            </span>
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              {entrant.total} pts
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
