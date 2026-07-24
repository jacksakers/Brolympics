import { useState } from 'react'
import { useGames } from '../../hooks/useGames.js'
import TurnOrderPanel from './TurnOrderPanel.jsx'
import { Gamepad2, BookOpen, ChevronDown, ChevronUp, Trash2, Shuffle, Plus, ImageIcon } from 'lucide-react'

export default function GamesSection({ eventId, teams, players }) {
  const { games, isLoading, error, addGame, editGame, removeGame, saveTurnOrder } = useGames(eventId)
  const [newGameName, setNewGameName] = useState('')
  const [newGameFormat, setNewGameFormat] = useState('individual')
  const [expandedId, setExpandedId] = useState(null)
  const [editRules, setEditRules] = useState({})
  const [editImageUrl, setEditImageUrl] = useState({})

  async function handleAdd(e) {
    e.preventDefault()
    if (!newGameName.trim()) return
    await addGame(newGameName.trim(), newGameFormat)
    setNewGameName('')
  }

  async function handleSaveRules(game) {
    await editGame(game.id, { rules: editRules[game.id] ?? game.rules ?? '' })
  }

  async function handleSaveImageUrl(game) {
    await editGame(game.id, { image_url: editImageUrl[game.id] ?? game.image_url ?? '' })
  }

  function entrantsFor(format) {
    return format === 'team' ? teams : players
  }

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Gamepad2 size={16} className="text-[var(--accent)]" /> Games
      </h2>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <ul className="space-y-2">
        {games.map((game) => {
          const isExpanded = expandedId === game.id
          const rulesVal = editRules[game.id] ?? game.rules ?? ''
          const imgVal = editImageUrl[game.id] ?? game.image_url ?? ''

          return (
            <li key={game.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="flex items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{game.name}</p>
                  <p className="text-xs text-[var(--text-muted)] capitalize">{game.format}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : game.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Shuffle size={12} />
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGame(game.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Rules + image edit */}
              <div className="border-t border-[var(--border)] px-4 pb-4 pt-3 space-y-3">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    <BookOpen size={11} /> Rules
                  </label>
                  <textarea
                    value={rulesVal}
                    onChange={(e) => setEditRules((prev) => ({ ...prev, [game.id]: e.target.value }))}
                    onBlur={() => handleSaveRules(game)}
                    placeholder="Enter game rules (optional)…"
                    rows={3}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    <ImageIcon size={11} /> Image URL
                  </label>
                  <input
                    type="url"
                    value={imgVal}
                    onChange={(e) => setEditImageUrl((prev) => ({ ...prev, [game.id]: e.target.value }))}
                    onBlur={() => handleSaveImageUrl(game)}
                    placeholder="https://…"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                  {imgVal && (
                    <img
                      src={imgVal}
                      alt="Preview"
                      className="mt-2 h-24 w-full rounded-xl object-cover"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  )}
                </div>

                {isExpanded && (
                  <TurnOrderPanel
                    game={game}
                    entrants={entrantsFor(game.format)}
                    onSave={(entrantIds) => saveTurnOrder(game.id, entrantIds)}
                  />
                )}
              </div>
            </li>
          )
        })}
        {!isLoading && games.length === 0 && <li className="py-4 text-sm text-[var(--text-muted)]">No games yet.</li>}
      </ul>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          value={newGameName}
          onChange={(e) => setNewGameName(e.target.value)}
          placeholder="New game name (e.g. Jenga)"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <div className="flex gap-2">
          <select
            value={newGameFormat}
            onChange={(e) => setNewGameFormat(e.target.value)}
            className="min-h-11 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)]"
          >
            <option value="individual">Individual</option>
            <option value="team">Team</option>
          </select>
          <button
            type="submit"
            disabled={!newGameName.trim()}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-black disabled:opacity-50"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </form>
    </section>
  )
}
