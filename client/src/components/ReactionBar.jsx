import { useState } from 'react'
import { usePlayerIdentity } from '../context/PlayerIdentityContext.jsx'
import { SmilePlus } from 'lucide-react'

const EMOJI_PALETTE = ['👍', '🔥', '🤡', '😂', '❤️', '🍺']

/**
 * Reaction bar for a single History feed entry: shows emoji counts and
 * lets the current device identity toggle a reaction. See
 * docs/new_features.txt "History Feed & Reaction System".
 *
 * @param {{reactions: Array<{player_id: number, emoji: string}>, onReact: (emoji: string) => void}} props
 */
export default function ReactionBar({ reactions, onReact }) {
  const { activePlayer, openPicker } = usePlayerIdentity()
  const [pickerOpen, setPickerOpen] = useState(false)

  const counts = new Map()
  const mine = new Set()
  for (const r of reactions) {
    counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1)
    if (activePlayer && r.player_id === activePlayer.id) mine.add(r.emoji)
  }

  function handlePick(emoji) {
    setPickerOpen(false)
    if (!activePlayer) {
      openPicker()
      return
    }
    onReact(emoji)
  }

  return (
    <div className="relative mt-2 flex flex-wrap items-center gap-1.5">
      {[...counts.entries()].map(([emoji, count]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handlePick(emoji)}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
            mine.has(emoji)
              ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
              : 'border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--border-bright)]'
          }`}
        >
          <span>{emoji}</span>
          <span className="text-[var(--text-secondary)]">{count}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => setPickerOpen((open) => !open)}
        aria-label="Add reaction"
        className="flex items-center justify-center rounded-full border border-dashed border-[var(--border-bright)] p-1 text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <SmilePlus size={13} />
      </button>
      {pickerOpen && (
        <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1.5 shadow-xl">
          {EMOJI_PALETTE.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handlePick(emoji)}
              className="rounded-lg p-1.5 text-base hover:bg-[var(--bg-base)]"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
