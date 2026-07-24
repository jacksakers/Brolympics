import { useState } from 'react'
import { useEvent } from '../context/EventContext.jsx'
import { usePlayers } from '../hooks/usePlayers.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { useWheelOptions } from '../hooks/useWheelOptions.js'
import { usePlayerIdentity } from '../context/PlayerIdentityContext.jsx'
import PhotoAttach from '../components/PhotoAttach.jsx'
import SpinningWheel from '../components/wheel/SpinningWheel.jsx'
import { Sparkles, Skull, Zap, Users, Dices, Plus, X, Undo2 } from 'lucide-react'

const MODES = [
  { id: 'penalty', label: 'Penalty', Icon: Skull },
  { id: 'challenge', label: 'Challenge', Icon: Zap },
  { id: 'players', label: 'Players', Icon: Users },
  { id: 'custom', label: 'Custom', Icon: Dices },
]

/** Editable list of slices for one wheel mode, with an optional point
 * value per slice (prefilled into the bonus popup when it's spun). */
function EditableSliceList({ options, addOption, removeOption, placeholder }) {
  const [draftLabel, setDraftLabel] = useState('')
  const [draftPoints, setDraftPoints] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!draftLabel.trim()) return
    addOption(draftLabel, draftPoints)
    setDraftLabel('')
    setDraftPoints('')
  }

  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => (
          <li
            key={option.id}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] py-1 pl-3 pr-1.5 text-xs text-[var(--text-secondary)]"
          >
            {option.label}
            {option.points != null && (
              <span className={`font-black ${option.points >= 0 ? 'text-[var(--success)]' : 'text-red-400'}`}>
                {option.points >= 0 ? `+${option.points}` : option.points}
              </span>
            )}
            <button
              type="button"
              onClick={() => removeOption(option.id)}
              aria-label={`Remove ${option.label}`}
              className="rounded-full p-0.5 text-[var(--text-muted)] hover:text-red-400"
            >
              <X size={12} />
            </button>
          </li>
        ))}
        {options.length === 0 && <li className="text-xs text-[var(--text-muted)]">No slices yet — add some below.</li>}
      </ul>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          placeholder={placeholder}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={draftPoints}
            onChange={(e) => setDraftPoints(e.target.value)}
            placeholder="Pts (optional)"
            className="min-h-11 w-28 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] sm:w-24 sm:flex-none"
          />
          <button
            type="submit"
            disabled={!draftLabel.trim()}
            aria-label="Add slice"
            className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-[var(--accent)] px-3 text-sm font-bold text-black disabled:opacity-50"
          >
            <Plus size={14} />
          </button>
        </div>
      </form>
    </div>
  )
}

/** Manages which players are currently "in" the players wheel — spun
 * players can be removed with one tap and added back just as easily.
 * This state is intentionally ephemeral (not persisted server-side),
 * matching the client-side turn order generator. */
function PlayerWheelPanel({ players, excludedIds, onRemove, onAddBack }) {
  const included = players.filter((p) => !excludedIds.has(p.id))
  const excluded = players.filter((p) => excludedIds.has(p.id))

  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-2">
        {included.map((player) => (
          <li
            key={player.id}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] py-1 pl-3 pr-1.5 text-xs text-[var(--text-secondary)]"
          >
            {player.name}
            <button
              type="button"
              onClick={() => onRemove(player.id)}
              aria-label={`Remove ${player.name} from wheel`}
              className="rounded-full p-0.5 text-[var(--text-muted)] hover:text-red-400"
            >
              <X size={12} />
            </button>
          </li>
        ))}
        {included.length === 0 && <li className="text-xs text-[var(--text-muted)]">No players left — add someone back below.</li>}
      </ul>
      {excluded.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Removed</p>
          <ul className="flex flex-wrap gap-2">
            {excluded.map((player) => (
              <li
                key={player.id}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-[var(--border)] bg-[var(--bg-card)]/50 py-1 pl-3 pr-1.5 text-xs text-[var(--text-muted)] line-through"
              >
                {player.name}
                <button
                  type="button"
                  onClick={() => onAddBack(player.id)}
                  aria-label={`Add ${player.name} back to wheel`}
                  className="rounded-full p-0.5 text-[var(--text-muted)] no-underline hover:text-[var(--accent)]"
                >
                  <Undo2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/** Inline panel shown below the "wheel has spoken" result once a
 * penalty/challenge/custom slice is spun: pick who it applies to,
 * optionally tweak the text/photo, and log it as a bonus-point
 * transaction in one tap. */
function WheelBonusPanel({ option, players, onSubmit, onClose }) {
  const [playerId, setPlayerId] = useState('')
  const [reason, setReason] = useState(option.label)
  const [pointsValue, setPointsValue] = useState(option.points != null ? String(option.points) : '')
  const [imageUrl, setImageUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const points = Number(pointsValue)
  const canSubmit = playerId && reason.trim() && Number.isFinite(points) && points !== 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      await onSubmit({ playerId: Number(playerId), points, reason: reason.trim(), imageUrl })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--text-primary)]">Log It</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          required
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)]"
        >
          <option value="">Select a player…</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            inputMode="numeric"
            value={pointsValue}
            onChange={(e) => setPointsValue(e.target.value)}
            placeholder="Points (e.g. 10 or -5)"
            className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] sm:w-32"
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        <PhotoAttach imageUrl={imageUrl} onChange={setImageUrl} />

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-black disabled:opacity-50 hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Zap size={16} /> Award Points
        </button>
      </form>
    </div>
  )
}

export default function WheelPage() {
  const { event } = useEvent()
  const { players } = usePlayers(event.id)
  const { addTransaction } = useTransactions(event.id)
  const { activePlayerId } = usePlayerIdentity()
  const [mode, setMode] = useState('penalty')
  const [winner, setWinner] = useState(null)
  const [pendingOption, setPendingOption] = useState(null)
  const [excludedPlayerIds, setExcludedPlayerIds] = useState(new Set())

  const penaltyOptions = useWheelOptions(event.id, 'penalty')
  const challengeOptions = useWheelOptions(event.id, 'challenge')
  const customOptions = useWheelOptions(event.id, 'custom')

  const editableByMode = { penalty: penaltyOptions, challenge: challengeOptions, custom: customOptions }
  const includedPlayers = players.filter((p) => !excludedPlayerIds.has(p.id))

  const slices =
    mode === 'players'
      ? includedPlayers.map((p) => p.name)
      : editableByMode[mode].options.map((o) => o.label)

  function handleResult(label, index) {
    setWinner(label)
    if (mode === 'players') return
    setPendingOption(editableByMode[mode].options[index])
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setWinner(null)
    setPendingOption(null)
  }

  function removePlayer(id) {
    setExcludedPlayerIds((prev) => new Set(prev).add(id))
  }

  function addPlayerBack(id) {
    setExcludedPlayerIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  async function handleBonusSubmit({ playerId, points, reason, imageUrl }) {
    await addTransaction({
      player_id: playerId,
      points,
      reason,
      image_url: imageUrl,
      created_by_player_id: activePlayerId,
    })
    setPendingOption(null)
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-[var(--accent)]" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Wheel of Destiny</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1">
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleModeChange(id)}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === id ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'players' ? (
        <PlayerWheelPanel
          players={players}
          excludedIds={excludedPlayerIds}
          onRemove={removePlayer}
          onAddBack={addPlayerBack}
        />
      ) : (
        <EditableSliceList
          options={editableByMode[mode].options}
          addOption={editableByMode[mode].addOption}
          removeOption={editableByMode[mode].removeOption}
          placeholder={mode === 'custom' ? 'Type a custom option…' : 'Add a slice…'}
        />
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] py-6">
        <SpinningWheel slices={slices} onResult={handleResult} />
      </div>

      {winner && (
        <div className="rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-dim)] px-4 py-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">The wheel has spoken</p>
          <p className="mt-1 text-xl font-black text-[var(--text-primary)]">{winner}</p>
          {mode === 'players' && (
            <button
              type="button"
              onClick={() => {
                const chosen = includedPlayers.find((p) => p.name === winner)
                if (chosen) removePlayer(chosen.id)
              }}
              className="mt-3 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Remove from wheel
            </button>
          )}
        </div>
      )}

      {pendingOption && (
        <WheelBonusPanel
          option={pendingOption}
          players={players}
          onSubmit={handleBonusSubmit}
          onClose={() => setPendingOption(null)}
        />
      )}
    </section>
  )
}
