import { useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions.js'
import { calculatePlayerTotals } from '../../utils/calculateScores.js'
import { snakeDraftTeams } from '../../utils/generateBalancedTeams.js'
import { generateTurnOrder } from '../../utils/generateTurnOrder.js'
import { Shuffle, Scale } from 'lucide-react'

/**
 * Auto-balances players into the event's existing teams, either by a
 * "snake draft" seeded on current leaderboard standings (so the
 * strongest players spread across teams instead of stacking one squad)
 * or a plain random shuffle. See docs/new_features.txt
 * "Balanced Team Generator".
 */
export default function TeamGeneratorPanel({ eventId, teams, players, assignPlayerTeam }) {
  const { transactions } = useTransactions(eventId)
  const [preview, setPreview] = useState(null)

  const canGenerate = teams.length >= 2 && players.length >= teams.length

  function buildPreview(groups) {
    setPreview(
      groups.map((group, i) => ({
        team: teams[i],
        players: group,
      })),
    )
  }

  function generateBalanced() {
    const totals = calculatePlayerTotals(transactions, players)
    const totalsById = Object.fromEntries(totals.map((t) => [t.id, t.total]))
    buildPreview(snakeDraftTeams(players, totalsById, teams.length))
  }

  function generateRandom() {
    const shuffled = generateTurnOrder(players)
    const groups = Array.from({ length: teams.length }, () => [])
    shuffled.forEach((player, i) => groups[i % teams.length].push(player))
    buildPreview(groups)
  }

  async function applyPreview() {
    if (!preview) return
    for (const { team, players: group } of preview) {
      for (const player of group) {
        await assignPlayerTeam(player.id, team.id)
      }
    }
    setPreview(null)
  }

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Scale size={16} className="text-[var(--accent)]" /> Team Generator
      </h2>
      <p className="text-xs text-[var(--text-muted)]">
        Split players across your {teams.length || 0} existing team{teams.length === 1 ? '' : 's'}, seeded on current
        standings or fully random.
      </p>

      {!canGenerate && (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-xs text-[var(--text-muted)]">
          Add at least 2 teams and enough players (one per team) above to generate teams.
        </p>
      )}

      {canGenerate && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateBalanced}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/50 px-3 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors"
          >
            <Scale size={14} /> Balanced (Snake Draft)
          </button>
          <button
            type="button"
            onClick={generateRandom}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--border-bright)] transition-colors"
          >
            <Shuffle size={14} /> Random Shuffle
          </button>
        </div>
      )}

      {preview && (
        <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          {preview.map(({ team, players: group }) => (
            <div key={team.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{team.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {group.map((p) => p.name).join(', ') || '—'}
              </p>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={applyPreview}
              className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-bold text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              Apply to Players
            </button>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--border-bright)]"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
