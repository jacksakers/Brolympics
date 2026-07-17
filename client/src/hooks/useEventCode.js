import { useCallback, useState } from 'react'

const STORAGE_KEY = 'brolympics_event_code'

/**
 * Reads/writes the current event's secret code in localStorage so a
 * returning visitor bypasses the join screen. See docs/SDD.md §3.
 */
export function useEventCode() {
  const [eventCode, setEventCodeState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || null,
  )

  const setEventCode = useCallback((code) => {
    localStorage.setItem(STORAGE_KEY, code)
    setEventCodeState(code)
  }, [])

  const clearEventCode = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setEventCodeState(null)
  }, [])

  return { eventCode, setEventCode, clearEventCode }
}
