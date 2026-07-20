import { useState, useEffect } from 'react'

const STORAGE_KEY = 'brolympics_presets'

/**
 * Manages user-defined quick-award point presets (label + point value),
 * persisted to localStorage since they're a personal convenience feature
 * rather than event data (see docs/coding_guidelines.md).
 */
export function usePresets() {
  const [presets, setPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  }, [presets])

  const addPreset = (label, points) =>
    setPresets((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label, points: Number(points) },
    ])

  const removePreset = (id) => setPresets((prev) => prev.filter((p) => p.id !== id))

  return { presets, addPreset, removePreset }
}
