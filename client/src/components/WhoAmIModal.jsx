import { usePlayerIdentity } from '../context/PlayerIdentityContext.jsx'
import { User, X } from 'lucide-react'

/**
 * "Who's using this device?" picker (docs/new_features.txt #1). Shown
 * automatically the first time a device is used on an event, and
 * reopenable any time via the header avatar chip to switch identity.
 */
export default function WhoAmIModal({ players }) {
  const { isPickerOpen, closePicker, choosePlayer, activePlayerId } = usePlayerIdentity()

  if (!isPickerOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="who-am-i-title"
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="who-am-i-title" className="text-base font-bold text-[var(--text-primary)]">
            Who's using this phone?
          </h3>
          <button
            type="button"
            onClick={closePicker}
            aria-label="Skip for now"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-xs text-[var(--text-secondary)]">
          Pick your name so your scores, photos, and reactions get credit. You can switch anytime from the header.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {players.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => choosePlayer(player.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
                activePlayerId === player.id
                  ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
                  : 'border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--border-bright)]'
              }`}
            >
              {player.image_url ? (
                <img
                  src={player.image_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
                  <User size={18} />
                </div>
              )}
              <span className="w-full truncate text-xs font-semibold text-[var(--text-primary)]">
                {player.name}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={closePicker}
          className="mt-4 w-full rounded-xl border border-[var(--border)] py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--border-bright)]"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
