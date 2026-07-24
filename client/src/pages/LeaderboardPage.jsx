import { useState } from 'react'
import { useEvent } from '../context/EventContext.jsx'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { calculatePlayerTotals, calculateTeamTotals } from '../utils/calculateScores.js'
import { Trophy, Users, User, TrendingUp } from 'lucide-react'

const RANK_STYLES = [
  { bg: 'bg-yellow-400/15 border-yellow-400/30', text: 'text-yellow-400', label: '1st' },
  { bg: 'bg-gray-400/10 border-gray-400/20', text: 'text-gray-300', label: '2nd' },
  { bg: 'bg-orange-400/10 border-orange-400/20', text: 'text-orange-400', label: '3rd' },
]

/** Player photo, or a small stack of team member photos, for a leaderboard row. */
function RankAvatar({ entrant, onExpand }) {
  const avatars = entrant.image_url ? [entrant.image_url] : entrant.memberAvatars ?? []

  if (avatars.length === 0) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
        <User size={14} />
      </div>
    )
  }

  return (
    <div className="flex -space-x-3">
      {avatars.map((url, i) => (
        <img
          key={url + i}
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onClick={(e) => {
            e.stopPropagation()
            onExpand(url, entrant.name)
          }}
          className="h-8 w-8 cursor-pointer rounded-full border-2 border-[var(--bg-card)] object-cover transition-transform hover:scale-105"
          style={{ zIndex: avatars.length - i }}
          onError={(e) => (e.target.style.display = 'none')}
        />
      ))}
    </div>
  )
}

export default function LeaderboardPage() {
  const { event } = useEvent()
  const { teams, isLoading: teamsLoading } = useTeams(event.id)
  const { players, isLoading: playersLoading } = usePlayers(event.id)
  const { transactions, isLoading: txLoading, error } = useTransactions(event.id)
  const [view, setView] = useState('teams')
  const [expandedAvatar, setExpandedAvatar] = useState(null)

  const isLoading = teamsLoading || playersLoading || txLoading
  const hasTeams = teams.length > 0
  const activeView = hasTeams ? view : 'players'

  const rankings =
    activeView === 'teams'
      ? calculateTeamTotals(transactions, teams, players)
      : calculatePlayerTotals(transactions, players)

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy size={20} className="text-[var(--accent)]" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Leaderboard</h2>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      {hasTeams && (
        <div className="flex gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1">
          {[['teams', Users, 'Teams'], ['players', User, 'Players']].map(([val, Icon, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setView(val)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                activeView === val
                  ? 'bg-[var(--accent)] text-black shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--bg-card)]" />
          ))}
        </div>
      )}

      {!isLoading && rankings.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] py-12">
          <TrendingUp size={32} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">No scores yet — play some games!</p>
        </div>
      )}

      <ol className="space-y-2">
        {rankings.map((entrant, index) => {
          const style = RANK_STYLES[index]
          const teamMembers =
            activeView === 'teams' ? players.filter((p) => p.team_id === entrant.id) : []
          return (
            <li
              key={entrant.id}
              className={`rounded-xl border p-4 transition-colors ${
                style ? style.bg : 'border-[var(--border)] bg-[var(--bg-card)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                    style ? `${style.text} ring-1 ring-current` : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {style ? style.label : index + 1}
                </div>
                <RankAvatar
                  entrant={entrant}
                  onExpand={(url, name) => setExpandedAvatar({ url, name })}
                />
                <span className="flex-1 font-semibold text-[var(--text-primary)]">{entrant.name}</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-black ${style ? style.text : 'text-[var(--accent)]'}`}>{entrant.total}</span>
                  <span className="text-xs text-[var(--text-muted)]">pts</span>
                </div>
              </div>
              {activeView === 'teams' && teamMembers.length > 0 && (
                <p className="mt-2 truncate pl-11 text-xs text-[var(--text-muted)]">
                  {teamMembers.map((p) => p.name).join(', ')}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      {expandedAvatar && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpandedAvatar(null)}
          onKeyDown={(e) => e.key === 'Escape' && setExpandedAvatar(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/80 p-6"
        >
          <img
            src={expandedAvatar.url}
            alt={expandedAvatar.name}
            className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          <p className="text-sm font-semibold text-white">{expandedAvatar.name}</p>
        </div>
      )}
    </section>
  )
}
