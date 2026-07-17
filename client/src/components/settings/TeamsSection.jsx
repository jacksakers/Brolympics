import { useState } from 'react'

/**
 * Settings UI to add, rename, and delete Teams for an event. See
 * docs/SDD.md §4.2 (Settings tab) and docs/implementation_plan.md Phase 4.
 *
 * @param {{teamsState: ReturnType<typeof import('../../hooks/useTeams.js').useTeams>}} props
 */
export default function TeamsSection({ teamsState }) {
  const { teams, isLoading, error, addTeam, renameTeam, removeTeam } =
    teamsState
  const [newTeamName, setNewTeamName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTeamName.trim()) return
    await addTeam(newTeamName.trim())
    setNewTeamName('')
  }

  function startEditing(team) {
    setEditingId(team.id)
    setEditingName(team.name)
  }

  async function handleRename(e) {
    e.preventDefault()
    if (!editingName.trim()) return
    await renameTeam(editingId, editingName.trim())
    setEditingId(null)
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        Teams
      </h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {teams.map((team) => (
          <li
            key={team.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            {editingId === team.id ? (
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
                  {team.name}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(team)}
                    className="min-h-11 rounded px-3 text-sm text-purple-600 dark:text-purple-400"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTeam(team.id)}
                    className="min-h-11 rounded px-3 text-sm text-red-600 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {!isLoading && teams.length === 0 && (
          <li className="text-sm text-gray-400">
            No teams yet — players can still play individually.
          </li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="New team name"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={!newTeamName.trim()}
          className="min-h-11 rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  )
}
