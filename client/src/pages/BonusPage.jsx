import { useState } from 'react'
import { useEvent } from '../context/EventContext.jsx'
import { useTeams } from '../hooks/useTeams.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { useTransactions } from '../hooks/useTransactions.js'
import { usePresets } from '../hooks/usePresets.js'
import { usePlayerIdentity } from '../context/PlayerIdentityContext.jsx'
import PhotoAttach from '../components/PhotoAttach.jsx'
import { Zap, Bookmark, Users, User } from 'lucide-react'

export default function BonusPage() {
  const { event } = useEvent()
  const { teams } = useTeams(event.id)
  const { players } = usePlayers(event.id)
  const { addTransaction, error } = useTransactions(event.id)
  const { presets } = usePresets()
  const { activePlayerId } = usePlayerIdentity()

  const hasTeams = teams.length > 0
  const [entrantType, setEntrantType] = useState('player')
  const [entrantId, setEntrantId] = useState('')
  const [pointsValue, setPointsValue] = useState('')
  const [reason, setReason] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const entrants = entrantType === 'team' ? teams : players

  function applyPreset(preset) {
    setPointsValue(String(preset.points))
    setReason(preset.label)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const points = Number(pointsValue)
    if (!entrantId || !Number.isFinite(points) || points === 0 || !reason.trim()) return

    setIsSubmitting(true)
    try {
      await addTransaction({
        [entrantType === 'team' ? 'team_id' : 'player_id']: Number(entrantId),
        points,
        reason: reason.trim(),
        image_url: imageUrl,
        created_by_player_id: activePlayerId,
      })
      setEntrantId('')
      setPointsValue('')
      setReason('')
      setImageUrl(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={20} className="text-[var(--accent)]" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Bonus Points</h2>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      {success && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-400">
          Points awarded!
        </div>
      )}

      {presets.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <Bookmark size={12} /> Quick Presets
          </p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="max-w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {preset.label}
                <span className={`ml-1.5 font-black ${preset.points >= 0 ? 'text-[var(--success)]' : 'text-red-400'}`}>
                  {preset.points >= 0 ? `+${preset.points}` : preset.points}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {hasTeams && (
          <div className="flex gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1">
            {[['player', User, 'Player'], ['team', Users, 'Team']].map(([val, Icon, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setEntrantType(val)
                  setEntrantId('')
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  entrantType === val
                    ? 'bg-[var(--accent)] text-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        )}

        <select
          value={entrantId}
          onChange={(e) => setEntrantId(e.target.value)}
          className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)]"
        >
          <option value="">Select {entrantType === 'team' ? 'a team' : 'a player'}…</option>
          {entrants.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
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
            className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] sm:w-28"
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (e.g. Drank a beer)"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        <PhotoAttach imageUrl={imageUrl} onChange={setImageUrl} />

        <button
          type="submit"
          disabled={isSubmitting || !entrantId || !pointsValue || !reason.trim()}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-black disabled:opacity-50 hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Zap size={16} /> Award Points
        </button>
      </form>
    </section>
  )
}