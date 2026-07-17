import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvent } from '../context/EventContext.jsx'

/**
 * Landing page: create a new event or join an existing one by code.
 * See docs/SDD.md §4.1.
 */
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
      // error is surfaced via context
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
      // error is surfaced via context
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white p-4 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        🏆 Brolympics
      </h1>

      <form onSubmit={handleCreate} className="w-full max-w-sm space-y-3">
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Event name (e.g. Lake Trip 2026)"
          className="w-full rounded-lg border border-gray-300 p-3 text-base dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={isSubmitting || !eventName.trim()}
          className="min-h-11 w-full rounded-lg bg-purple-600 p-3 text-base font-semibold text-white disabled:opacity-50"
        >
          Create New Event
        </button>
      </form>

      <div className="flex w-full max-w-sm items-center gap-3 text-gray-400">
        <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
        or
        <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
      </div>

      <form onSubmit={handleJoin} className="w-full max-w-sm space-y-3">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter event code"
          maxLength={6}
          className="w-full rounded-lg border border-gray-300 p-3 text-center text-base uppercase tracking-widest dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={isSubmitting || !joinCode.trim()}
          className="min-h-11 w-full rounded-lg border border-purple-600 p-3 text-base font-semibold text-purple-600 disabled:opacity-50 dark:text-purple-400"
        >
          Join Existing Event
        </button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
