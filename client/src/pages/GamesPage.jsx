import { useState } from 'react'
import { useEvent } from '../context/EventContext.jsx'
import { useGames } from '../hooks/useGames.js'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { usePlayerIdentity } from '../context/PlayerIdentityContext.jsx'
import GameScoreForm from '../components/games/GameScoreForm.jsx'
import { Gamepad2, ChevronDown, ChevronUp, BookOpen, Users, User } from 'lucide-react'

export default function GamesPage() {
  const { event } = useEvent()
  const { games, isLoading, error } = useGames(event.id)
  const { teams } = useTeams(event.id)
  const { players } = usePlayers(event.id)
  const { addTransaction } = useTransactions(event.id)
  const { activePlayerId } = usePlayerIdentity()
  const [selectedGameId, setSelectedGameId] = useState(null)

  const selectedGame = games.find((g) => g.id === selectedGameId) ?? null
  const entrants = selectedGame
    ? selectedGame.format === 'team' ? teams : players
    : []

  async function handleSubmitScores(scores, imageUrl) {
    for (const { entrantId, points } of scores) {
      await addTransaction({
        game_id: selectedGame.id,
        [selectedGame.format === 'team' ? 'team_id' : 'player_id']: entrantId,
        points,
        reason: selectedGame.name,
        image_url: imageUrl,
        created_by_player_id: activePlayerId,
      })
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Gamepad2 size={20} className="text-[var(--accent)]" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Games</h2>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      {!isLoading && games.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] py-12">
          <Gamepad2 size={32} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">No games yet. Add one in Settings.</p>
        </div>
      )}

      <div className="space-y-2">
        {games.map((game) => {
          const isSelected = selectedGameId === game.id
          return (
            <div
              key={game.id}
              className={`rounded-2xl border transition-all ${
                isSelected
                  ? 'border-[var(--accent)]/50 bg-[var(--accent-dim)]'
                  : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-bright)]'
              }`}
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 p-4 text-left"
                onClick={() => setSelectedGameId(isSelected ? null : game.id)}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isSelected ? 'bg-[var(--accent)] text-black' : 'bg-[var(--bg-base)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Gamepad2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">{game.name}</p>
                  <p className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    {game.format === 'team' ? <Users size={11} /> : <User size={11} />}
                    {game.format === 'team' ? 'Team' : 'Individual'}
                  </p>
                </div>
                {isSelected ? (
                  <ChevronUp size={16} className="text-[var(--accent)]" />
                ) : (
                  <ChevronDown size={16} className="text-[var(--text-muted)]" />
                )}
              </button>

              {isSelected && (
                <div className="border-t border-[var(--accent)]/20 px-4 pb-4">
                  {game.rules && (
                    <div className="mb-4 flex gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3">
                      <BookOpen size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Rules</p>
                        <p className="whitespace-pre-wrap text-xs text-[var(--text-secondary)] leading-relaxed">{game.rules}</p>
                      </div>
                    </div>
                  )}
                  {game.image_url && (
                    <img
                      src={game.image_url}
                      alt={game.name}
                      className="mb-4 w-full max-h-48 rounded-xl object-cover"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  )}
                  <GameScoreForm game={selectedGame} entrants={entrants} onSubmitScores={handleSubmitScores} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
