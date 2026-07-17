import { useState } from 'react'
import { useGames } from '../../hooks/useGames.js'
import TurnOrderPanel from './TurnOrderPanel.jsx'

/**
 * Settings UI to create/delete Games, assign a format (team/individual),
 * and generate a random turn order. See docs/SDD.md §4.2 and
 * docs/implementation_plan.md Phase 4.
 *
 * @param {{eventId: number, teams: Array, players: Array}} props
 */
export default function GamesSection({ eventId, teams, players }) {
  const { games, isLoading, error, addGame, removeGame } = useGames(eventId)
  const [newGameName, setNewGameName] = useState('')
  const [newGameFormat, setNewGameFormat] = useState('individual')
  const [expandedId, setExpandedId] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!newGameName.trim()) return
    await addGame(newGameName.trim(), newGameFormat)
    setNewGameName('')
  }

  function entrantsFor(format) {
    return format === 'team' ? teams : players
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

      <ul className="space-y-2">
        {games.map((game) => (
          <li
            key={game.id}
            className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {game.name}
                </p>
                <p className="text-xs text-gray-400">{game.format}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(expandedId === game.id ? null : game.id)
                  }
                  className="min-h-11 rounded px-3 text-sm text-purple-600 dark:text-purple-400"
                >
                  {expandedId === game.id ? 'Hide' : 'Turn Order'}
                </button>
                <button
                  type="button"
                  onClick={() => removeGame(game.id)}
                  className="min-h-11 rounded px-3 text-sm text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedId === game.id && (
              <TurnOrderPanel entrants={entrantsFor(game.format)} />
            )}
          </li>
        ))}
        {!isLoading && games.length === 0 && (
          <li className="text-sm text-gray-400">No games yet.</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          value={newGameName}
          onChange={(e) => setNewGameName(e.target.value)}
          placeholder="New game name (e.g. Jenga)"
          className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <div className="flex gap-2">
          <select
            value={newGameFormat}
            onChange={(e) => setNewGameFormat(e.target.value)}
            className="min-h-11 flex-1 rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="individual">Individual</option>
            <option value="team">Team</option>
          </select>
          <button
            type="submit"
            disabled={!newGameName.trim()}
            className="min-h-11 rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>
    </section>
  )
}
