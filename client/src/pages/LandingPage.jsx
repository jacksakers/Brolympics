import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvent } from '../context/EventContext.jsx'
import { Trophy, Users, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const { create, join, error } = useEvent()
  const navigate = useNavigate()
  const [eventName, setEventName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!eventName.trim()) return
    setIsSubmitting(true)
    try {
      await create(eventName.trim())
      navigate('/event')
    } catch {
      // error is surfaced via context's error state
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setIsSubmitting(true)
    try {
      await join(joinCode.trim().toUpperCase())
      navigate('/event')
    } catch {
      // error is surfaced via context's error state
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] p-4">
      {/* Hero */}
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]/30">
          <Trophy size={40} className="text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">BROLYMPICS</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">The ultimate friend-group scoreboard</p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Create */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <Trophy size={16} className="text-[var(--accent)]" />
            Start New Event
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Event name (e.g. Lake Trip 2026)"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
            <button
              type="submit"
              disabled={isSubmitting || !eventName.trim()}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-black transition-opacity disabled:opacity-50 hover:bg-[var(--accent-hover)]"
            >
              Create Event <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <div className="h-px flex-1 bg-[var(--border)]" />
          OR JOIN EXISTING
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Join */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <Users size={16} className="text-[var(--accent)]" />
            Join Event
          </h2>
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter event code"
              maxLength={6}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-center text-sm uppercase tracking-[0.3em] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:normal-case placeholder:tracking-normal"
            />
            <button
              type="submit"
              disabled={isSubmitting || !joinCode.trim()}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent)] px-4 text-sm font-bold text-[var(--accent)] transition-colors disabled:opacity-50 hover:bg-[var(--accent-dim)]"
            >
              Join Event <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {error && (
          <p role="alert" className="text-center text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}
