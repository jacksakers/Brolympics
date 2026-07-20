import { useState, useEffect } from 'react'

const KEY = 'brolympics_settings'
const DEFAULTS = { theme: 'dark', accentColor: 'green', compactMode: false, showStats: true }

/**
 * Manages personal UI preferences, persisted to localStorage since
 * they're device/user-specific rather than shared event data.
 */
export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }))

  return { settings, updateSetting }
}
