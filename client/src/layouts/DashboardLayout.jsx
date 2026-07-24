import { Navigate, Outlet } from 'react-router-dom'
import { useEvent } from '../context/EventContext.jsx'
import { usePlayers } from '../hooks/usePlayers.js'
import { PlayerIdentityProvider, usePlayerIdentity } from '../context/PlayerIdentityContext.jsx'
import BottomNav from '../components/BottomNav.jsx'
import WhoAmIModal from '../components/WhoAmIModal.jsx'
import { Trophy, User } from 'lucide-react'

function IdentityChip() {
  const { activePlayer, openPicker } = usePlayerIdentity()

  return (
    <button
      type="button"
      onClick={openPicker}
      aria-label="Switch player identity"
      className="ml-auto flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] py-1 pl-1 pr-3 hover:border-[var(--accent)] transition-colors"
    >
      {activePlayer?.image_url ? (
        <img
          src={activePlayer.image_url}
          alt=""
          className="h-6 w-6 rounded-full object-cover"
          onError={(e) => (e.target.style.display = 'none')}
        />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
          <User size={12} />
        </div>
      )}
      <span className="max-w-20 truncate text-xs font-semibold text-[var(--text-secondary)]">
        {activePlayer ? activePlayer.name : 'Who am I?'}
      </span>
    </button>
  )
}

export default function DashboardLayout() {
  const { event, isLoading } = useEvent()
  const { players } = usePlayers(event?.id)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">Loading event…</p>
        </div>
      </div>
    )
  }

  if (!event) return <Navigate to="/" replace />

  return (
    <PlayerIdentityProvider eventId={event.id} players={players}>
      <div className="min-h-screen bg-[var(--bg-base)] pb-16">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-dim)]">
              <Trophy size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[var(--text-primary)] leading-tight">{event.name}</h1>
              <p className="text-xs text-[var(--text-muted)] font-mono tracking-widest">CODE: {event.secret_code}</p>
            </div>
            {players.length > 0 && <IdentityChip />}
          </div>
        </header>

        <main className="p-4">
          <Outlet />
        </main>

        <BottomNav />
        <WhoAmIModal players={players} />
      </div>
    </PlayerIdentityProvider>
  )
}

