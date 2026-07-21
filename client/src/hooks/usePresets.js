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

  // Prefer the standards-compliant randomUUID when available (requires
  // a secure context), with a time+random fallback for plain HTTP dev.
  function genId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const addPreset = (label, points) =>
    setPresets((prev) => [...prev, { id: genId(), label, points: Number(points) }])

  const removePreset = (id) => setPresets((prev) => prev.filter((p) => p.id !== id))

  return { presets, addPreset, removePreset }
}
