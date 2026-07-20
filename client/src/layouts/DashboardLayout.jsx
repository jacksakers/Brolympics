import { Navigate, Outlet } from 'react-router-dom'
import { useEvent } from '../context/EventContext.jsx'
import BottomNav from '../components/BottomNav.jsx'
import { Trophy } from 'lucide-react'

export default function DashboardLayout() {
  const { event, isLoading } = useEvent()

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
        </div>
      </header>

      <main className="p-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
