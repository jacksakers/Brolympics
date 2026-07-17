import { useState } from 'react'
import { useEvent } from '../context/EventContext.jsx'
import { useGames } from '../hooks/useGames.js'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { useTransactions } from '../hooks/useTransactions.js'
import GameScoreForm from '../components/games/GameScoreForm.jsx'

/**
 * Games tab: pick a locked-in game and enter scores for its entrants
 * (teams or players, per the game's format). See docs/SDD.md §4.2 and
 * docs/implementation_plan.md Phase 5.
 */
export default function GamesPage() {
  const { event } = useEvent()
  const { games, isLoading, error } = useGames(event.id)
  const { teams } = useTeams(event.id)
  const { players } = usePlayers(event.id)
  const { addTransaction } = useTransactions(event.id)
  const [selectedGameId, setSelectedGameId] = useState(null)

  const selectedGame = games.find((g) => g.id === selectedGameId) ?? null
  const entrants = selectedGame
    ? selectedGame.format === 'team'
      ? teams
      : players
    : []

  async function handleSubmitScores(scores) {
    for (const { entrantId, points } of scores) {
      await addTransaction({
        game_id: selectedGame.id,
        [selectedGame.format === 'team' ? 'team_id' : 'player_id']: entrantId,
        points,
        reason: selectedGame.name,
      })
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        Games
      </h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {!isLoading && games.length === 0 && (
        <p className="text-sm text-gray-400">
          No games yet. Add one in Settings.
        </p>
      )}

      <ul className="flex flex-wrap gap-2">
        {games.map((game) => (
          <li key={game.id}>
            <button
              type="button"
              onClick={() =>
                setSelectedGameId(selectedGameId === game.id ? null : game.id)
              }
              className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${
                selectedGameId === game.id
                  ? 'border-purple-600 bg-purple-600 text-white'
                  : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              {game.name}
            </button>
          </li>
        ))}
      </ul>

      {selectedGame && (
        <GameScoreForm
          game={selectedGame}
          entrants={entrants}
          onSubmitScores={handleSubmitScores}
        />
      )}
    </section>
  )
}
