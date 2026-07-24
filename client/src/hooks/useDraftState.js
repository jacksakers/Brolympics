import { useState } from 'react'

/**
 * Like useState, but persists the value to sessionStorage under `key`
 * and rehydrates from it on mount.
 *
 * On mobile, opening the native camera/gallery picker from a file input
 * can cause Android/iOS to suspend or kill the background browser tab
 * to reclaim memory; when the user returns with their photo, the page
 * reloads from scratch and any in-progress form state is lost. Draft
 * state sidesteps that by saving as-you-type, so returning from the
 * picker restores exactly what was there before.
 *
 * @param {string} key - unique sessionStorage key for this draft
 * @param {*} initialValue - used when there's no stored draft yet
 * @returns {[*, (next: *|((prev: *) => *)) => void, () => void]} [value, setValue, clear]
 */
export function useDraftState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = sessionStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  function update(next) {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      try {
        sessionStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // ignore quota/serialization errors — draft persistence is best-effort
      }
      return resolved
    })
  }

  function clear() {
    try {
      sessionStorage.removeItem(key)
    } catch {
      // ignore
    }
    setValue(initialValue)
  }

  return [value, update, clear]
}
