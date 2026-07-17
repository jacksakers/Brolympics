import { useEvent } from '../context/EventContext.jsx'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { useGames } from '../hooks/useGames.js'
import { useTransactions } from '../hooks/useTransactions.js'

/**
 * History (Audit Log) tab: chronological feed of every transaction with
 * an Undo action that posts a compensating transaction, per
 * docs/SDD.md §4.2 and docs/coding_guidelines.md §4 "Immutability in
 * History". The API already returns transactions newest-first.
 */
export default function HistoryPage() {
  const { event } = useEvent()
  const { teams } = useTeams(event.id)
  const { players } = usePlayers(event.id)
  const { games } = useGames(event.id)
  const { transactions, isLoading, error, undoTransaction } = useTransactions(
    event.id,
  )

  const revertedIds = new Set(
    transactions
      .map((t) => t.reverts_transaction_id)
      .filter((id) => id != null),
  )

  function entrantName(tx) {
    if (tx.player_id) {
      return players.find((p) => p.id === tx.player_id)?.name ?? 'Unknown player'
    }
    if (tx.team_id) {
      return teams.find((t) => t.id === tx.team_id)?.name ?? 'Unknown team'
    }
    return 'Unknown'
  }

  function gameName(tx) {
    if (!tx.game_id) return null
    return games.find((g) => g.id === tx.game_id)?.name ?? null
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        History
      </h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {!isLoading && transactions.length === 0 && (
        <p className="text-sm text-gray-400">No transactions yet.</p>
      )}

      <ul className="space-y-2">
        {transactions.map((tx) => {
          const canUndo = !tx.reverts_transaction_id && !revertedIds.has(tx.id)
          const game = gameName(tx)

          return (
            <li
              key={tx.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {entrantName(tx)}{' '}
                  <span
                    className={
                      tx.points >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {tx.points >= 0 ? `+${tx.points}` : tx.points}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  {tx.reason}
                  {game ? ` · ${game}` : ''} ·{' '}
                  {new Date(tx.created_at).toLocaleString()}
                </p>
              </div>
              {canUndo && (
                <button
                  type="button"
                  onClick={() => undoTransaction(tx.id)}
                  className="min-h-11 rounded px-3 text-sm text-purple-600 dark:text-purple-400"
                >
                  Undo
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
