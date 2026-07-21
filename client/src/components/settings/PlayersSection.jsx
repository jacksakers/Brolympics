import { useState } from 'react'
import { Users, Pencil, Trash2, Check } from 'lucide-react'

export default function PlayersSection({ playersState, teams }) {
  const { players, isLoading, error, addPlayer, renamePlayer, assignPlayerTeam, removePlayer } = playersState
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
      <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Users size={16} className="text-[var(--accent)]" /> Players
      </h2>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <ul className="space-y-2">
        {players.map((player) => (
          <li key={player.id} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <div className="flex items-center justify-between gap-2">
              {editingId === player.id ? (
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
                  <div className="flex items-center gap-2">
                    {player.image_url && (
                      <img
                        src={player.image_url}
                        alt={player.name}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    )}
                    <span className="font-medium text-[var(--text-primary)]">{player.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEditing(player)}
                      className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePlayer(player.id)}
                      className="flex items-center gap-1 rounded-xl border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
            <select
              value={player.team_id ?? ''}
              onChange={(e) => handleTeamChange(player.id, e.target.value)}
              className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Individual (no team)</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </li>
        ))}
        {!isLoading && players.length === 0 && <li className="py-4 text-sm text-[var(--text-muted)]">No players yet.</li>}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="New player name"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={!newPlayerName.trim()}
          className="flex min-h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-black disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  )
}
