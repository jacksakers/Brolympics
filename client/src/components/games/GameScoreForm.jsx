import { useState } from 'react'
import { useDraftState } from '../../hooks/useDraftState.js'
import PhotoAttach from '../PhotoAttach.jsx'
import { CheckCircle } from 'lucide-react'

export default function GameScoreForm({ game, entrants, onSubmitScores }) {
  const [draft, setDraft, clearDraft] = useDraftState(`brolympics_game_score_draft_${game.id}`, {
    points: {},
    imageUrl: null,
  })
  const { points, imageUrl } = draft
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  function handlePointsChange(entrantId, value) {
    setDraft((prev) => ({ ...prev, points: { ...prev.points, [entrantId]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const scores = Object.entries(points)
      .map(([entrantId, value]) => ({ entrantId: Number(entrantId), points: Number(value) }))
      .filter((s) => Number.isFinite(s.points) && s.points !== 0)
    if (scores.length === 0) return
    setIsSubmitting(true)
    try {
      await onSubmitScores(scores, imageUrl)
      clearDraft()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-400">
          <CheckCircle size={16} /> Scores saved!
        </div>
      )}

      {entrants.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">
          No {game.format === 'team' ? 'teams' : 'players'} to score yet.
        </p>
      )}

      <ul className="space-y-2">
        {entrants.map((entrant) => (
          <li key={entrant.id} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">{entrant.name}</span>
            <input
              type="number"
              inputMode="numeric"
              value={points[entrant.id] ?? ''}
              onChange={(e) => handlePointsChange(entrant.id, e.target.value)}
              placeholder="0"
              className="min-h-11 w-24 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] px-3 text-right text-sm text-[var(--text-primary)]"
            />
          </li>
        ))}
      </ul>

      {entrants.length > 0 && (
        <>
          <PhotoAttach imageUrl={imageUrl} onChange={(url) => setDraft((prev) => ({ ...prev, imageUrl: url }))} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-black disabled:opacity-50 hover:bg-[var(--accent-hover)] transition-colors"
          >
            Save Scores
          </button>
        </>
      )}
    </form>
  )
}
