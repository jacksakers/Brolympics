import { createContext, useContext, useEffect, useState } from 'react'
import { useEventCode } from '../hooks/useEventCode.js'
import { createEvent, fetchEventByCode, updateEvent } from '../lib/api.js'

const EventContext = createContext(null)

/**
 * Provides the current event (validated against the server) plus
 * join/create/leave actions to the whole app, avoiding prop drilling per
 * docs/coding_guidelines.md.
 */
export function EventProvider({ children }) {
  const { eventCode, setEventCode, clearEventCode } = useEventCode()
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(eventCode))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!eventCode) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    fetchEventByCode(eventCode).then((found) => {
      if (cancelled) return
      if (found) {
        setEvent(found)
      } else {
        // Stored code no longer valid server-side; clear it.
        clearEventCode()
        setEvent(null)
      }
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [eventCode, clearEventCode])

  /** Creates a new event and stores/activates its code. */
  async function create(name) {
    setError(null)
    try {
      const created = await createEvent(name)
      setEvent(created)
      setEventCode(created.secret_code)
      return created
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /** Validates and joins an existing event by code. */
  async function join(code) {
    setError(null)
    const found = await fetchEventByCode(code)
    if (!found) {
      const message = 'Event code not found'
      setError(message)
      throw new Error(message)
    }
    setEvent(found)
    setEventCode(found.secret_code)
    return found
  }

  /** Clears the active event, returning the user to the landing page. */
  function leave() {
    clearEventCode()
    setEvent(null)
  }

  /** Renames the active event. */
  async function rename(name) {
    setError(null)
    try {
      const updated = await updateEvent(event.id, { name })
      setEvent(updated)
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return (
    <EventContext.Provider
      value={{ event, isLoading, error, create, join, leave, rename }}
    >
      {children}
    </EventContext.Provider>
  )
}

/** Reads the current event context. Must be used within EventProvider. */
export function useEvent() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider')
  }
  return context
}
