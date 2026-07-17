import { useState } from 'react'

/**
 * Settings UI to add, rename, delete Players, and assign them to a Team
 * (or leave unassigned for individual play). See docs/SDD.md §4.2 and
 * docs/implementation_plan.md Phase 4.
 *
 * @param {{playersState: ReturnType<typeof import('../../hooks/usePlayers.js').usePlayers>, teams: Array}} props
 */
export default function PlayersSection({ playersState, teams }) {
  const {
    players,
    isLoading,
    error,
    addPlayer,
    renamePlayer,
    assignPlayerTeam,
    removePlayer,
  } = playersState
  const [newPlayerName, setNewPlayerName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!newPlayerName.trim()) return
    await addPlayer(newPlayerName.trim())
    setNewPlayerName('')
  }

  function startEditing(player) {
    setEditingId(player.id)
    setEditingName(player.name)
  }

  async function handleRename(e) {
    e.preventDefault()
    if (!editingName.trim()) return
    await renamePlayer(editingId, editingName.trim())
    setEditingId(null)
  }

  function handleTeamChange(playerId, value) {
    assignPlayerTeam(playerId, value === '' ? null : Number(value))
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        Players
      </h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="flex items-center justify-between gap-2">
              {editingId === player.id ? (
                <form onSubmit={handleRename} className="flex flex-1 gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="min-w-0 flex-1 rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="min-h-11 rounded bg-purple-600 px-3 text-sm font-semibold text-white"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {player.name}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(player)}
                      className="min-h-11 rounded px-3 text-sm text-purple-600 dark:text-purple-400"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => removePlayer(player.id)}
                      className="min-h-11 rounded px-3 text-sm text-red-600 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>

            <select
              value={player.team_id ?? ''}
              onChange={(e) => handleTeamChange(player.id, e.target.value)}
              className="min-h-11 rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Individual (no team)</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </li>
        ))}
        {!isLoading && players.length === 0 && (
          <li className="text-sm text-gray-400">No players yet.</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="New player name"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={!newPlayerName.trim()}
          className="min-h-11 rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  )
}
