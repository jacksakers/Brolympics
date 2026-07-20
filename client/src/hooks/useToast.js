import { useState, useCallback } from 'react'

/**
 * Manages ephemeral toast notifications. Each toast auto-dismisses after
 * 3 seconds; components can also remove one early via removeToast.
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  )

  return { toasts, addToast, removeToast }
}
