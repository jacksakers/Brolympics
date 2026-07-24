import { useEvent } from '../context/EventContext.jsx'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { useGames } from '../hooks/useGames.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { useReactions } from '../hooks/useReactions.js'
import { usePlayerIdentity } from '../context/PlayerIdentityContext.jsx'
import ReactionBar from '../components/ReactionBar.jsx'
import { formatDateET } from '../utils/formatDate.js'
import { getEntrantName, getGameName } from '../utils/transactionHelpers.js'
import { History, Download, RotateCcw, Zap, Gamepad2, Minus } from 'lucide-react'

// Sanitize a cell value for CSV: escape double-quotes and prefix any
// value that starts with a spreadsheet formula trigger character with a
// tab to prevent formula injection when opened in Excel/Sheets.
function csvCell(v) {
  const s = String(v ?? '').replace(/"/g, '""')
  return /^[=+\-@\t]/.test(s) ? `"\t${s}"` : `"${s}"`
}

function exportCSV(transactions, players, teams, games) {
  const rows = [
    ['Date (ET)', 'Entrant', 'Points', 'Game', 'Reason', 'Type'],
    ...transactions.map((tx) => [
      formatDateET(tx.created_at),
      getEntrantName(tx, players, teams),
      tx.points,
      getGameName(tx, games) ?? '',
      tx.reason,
      tx.reverts_transaction_id ? 'Reversal' : tx.game_id ? 'Game Score' : 'Bonus',
    ]),
  ]

  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'brolympics-history.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function txType(tx) {
  if (tx.reverts_transaction_id) return 'reversal'
  if (tx.game_id) return 'game'
  return 'bonus'
}

const TYPE_BADGE = {
  game: { label: 'Game', Icon: Gamepad2, cls: 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]/30' },
  bonus: { label: 'Bonus', Icon: Zap, cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' },
  reversal: { label: 'Undo', Icon: RotateCcw, cls: 'bg-red-400/10 text-red-400 border-red-400/30' },
}

export default function HistoryPage() {
  const { event } = useEvent()
  const { teams } = useTeams(event.id)
  const { players } = usePlayers(event.id)
  const { games } = useGames(event.id)
  const { transactions, isLoading, error, undoTransaction } = useTransactions(event.id)
  const { reactions, react } = useReactions(event.id)
  const { activePlayer } = usePlayerIdentity()

  const revertedIds = new Set(
    transactions.map((t) => t.reverts_transaction_id).filter((id) => id != null),
  )

  function entrantName(tx) {
    return getEntrantName(tx, players, teams)
  }

  function loggedByName(tx) {
    if (!tx.created_by_player_id) return null
    return players.find((p) => p.id === tx.created_by_player_id)?.name ?? null
  }

  function reactionsFor(tx) {
    return reactions.filter((r) => r.transaction_id === tx.id)
  }

  function displayReason(tx) {
    const game = getGameName(tx, games)
    const reason = typeof tx.reason === 'string' ? tx.reason.trim() : ''
    if (!reason) return game ?? ''
    // Avoid duplicating the name (e.g. "Golf · Golf") when the reason
    // already matches the game name. Trim both sides defensively.
    if (game && reason.toLowerCase() === game.trim().toLowerCase()) {
      return game
    }
    return game ? `${reason} · ${game}` : reason
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={20} className="text-[var(--accent)]" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">History</h2>
        </div>
        {/* {transactions.length > 0 && (
          <button
            type="button"
            onClick={() => exportCSV(transactions, players, teams, games)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        )} */}
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      {!isLoading && transactions.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] py-12">
          <History size={32} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">No transactions yet.</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--bg-card)]" />
          ))}
        </div>
      )}

      <ul className="space-y-2">
        {transactions.map((tx) => {
          const canUndo = !tx.reverts_transaction_id && !revertedIds.has(tx.id)
          const type = txType(tx)
          const badge = TYPE_BADGE[type]
          const isReverted = revertedIds.has(tx.id)

          return (
            <li
              key={tx.id}
              className={`rounded-2xl border p-4 transition-colors ${
                isReverted ? 'border-[var(--border)] bg-[var(--bg-card)] opacity-50' : 'border-[var(--border)] bg-[var(--bg-card)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
                      <badge.Icon size={11} />
                      {badge.label}
                    </span>
                    {isReverted && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">
                        <Minus size={11} /> Undone
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{entrantName(tx)}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">{displayReason(tx)}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {formatDateET(tx.created_at)}
                    {loggedByName(tx) && ` · logged by ${loggedByName(tx)}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-lg font-black ${tx.points >= 0 ? 'text-[var(--success)]' : 'text-red-400'}`}>
                    {tx.points >= 0 ? `+${tx.points}` : tx.points}
                  </span>
                  {canUndo && (
                    <button
                      type="button"
                      onClick={() => undoTransaction(tx.id)}
                      className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-muted)] hover:border-red-400/50 hover:text-red-400 transition-colors"
                    >
                      <RotateCcw size={11} /> Undo
                    </button>
                  )}
                </div>
              </div>
              {tx.image_url && (
                <a
                  href={tx.image_url}
                  download
                  className="group relative mt-3 flex max-h-64 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-base)]"
                >
                  <img
                    src={tx.image_url}
                    alt="Bonus"
                    className="max-h-64 w-full object-contain"
                    onError={(e) => (e.target.parentElement.style.display = 'none')}
                  />
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white opacity-80 transition-opacity group-hover:opacity-100">
                    <Download size={12} /> Save
                  </span>
                </a>
              )}
              <ReactionBar
                reactions={reactionsFor(tx)}
                onReact={(emoji) => react(tx.id, activePlayer?.id, emoji)}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
