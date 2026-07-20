import { useState } from 'react'
import { Users, Pencil, Trash2, Check } from 'lucide-react'

export default function TeamsSection({ teamsState }) {
  const { teams, isLoading, error, addTeam, renameTeam, removeTeam } = teamsState
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
      <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Users size={16} className="text-[var(--accent)]" /> Teams
      </h2>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <ul className="space-y-2">
        {teams.map((team) => (
          <li key={team.id} className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
            {editingId === team.id ? (
              <form onSubmit={handleRename} className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="min-h-10 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 text-sm text-[var(--text-primary)]"
                  autoFocus
                />
                <button type="submit" className="flex min-h-10 items-center gap-1 rounded-xl bg-[var(--accent)] px-3 text-sm font-bold text-black">
                  <Check size={14} />
                </button>
              </form>
            ) : (
              <>
                <span className="font-medium text-[var(--text-primary)]">{team.name}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEditing(team)}
                    className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTeam(team.id)}
                    className="flex items-center gap-1 rounded-xl border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {!isLoading && teams.length === 0 && (
          <li className="py-2 text-sm text-[var(--text-muted)]">No teams yet — players can still play individually.</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="New team name"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={!newTeamName.trim()}
          className="flex min-h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-black disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  )
}
