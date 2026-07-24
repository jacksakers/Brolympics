import { useEffect, useState } from 'react'

// Starter slices so the wheel is fun out of the box; fully editable per
// event and persisted locally (see docs/new_features.txt "Multi-Wheel
// Engine"). Tiebreaker has no defaults — it's always computed live from
// the leaderboard, and Custom starts blank for spontaneous bets.
const DEFAULTS = {
  penalty: [
    'Drink a mystery mix',
    'Play next game left-handed',
    'Wear the Shame Hat',
    '15 pushups, right now',
    'Sing your entrance song',
    'Give up your seat',
  ],
  challenge: [
    'Trick shot (+50 pts)',
    'Call family, explain the app (+30 pts)',
    'Chug water in 10s (+20 pts)',
    'High-five 3 strangers (+15 pts)',
    'Freestyle rap (+25 pts)',
  ],
  custom: [],
}

function storageKey(eventId, mode) {
  return `brolympics_wheel_${mode}_${eventId}`
}

function readOptions(eventId, mode) {
  if (!eventId) return DEFAULTS[mode] ?? []
  try {
    const raw = localStorage.getItem(storageKey(eventId, mode))
    return raw ? JSON.parse(raw) : (DEFAULTS[mode] ?? [])
  } catch {
    return DEFAULTS[mode] ?? []
  }
}

/**
 * Manages the editable slice list for a given Wheel of Destiny mode,
 * persisted per-event in localStorage since it's a party customization
 * rather than shared event data.
 *
 * @param {number|undefined} eventId
 * @param {'penalty'|'challenge'|'custom'} mode
 */
export function useWheelOptions(eventId, mode) {
  const [options, setOptions] = useState(() => readOptions(eventId, mode))

  useEffect(() => {
    setOptions(readOptions(eventId, mode))
  }, [eventId, mode])

  useEffect(() => {
    if (!eventId) return
    localStorage.setItem(storageKey(eventId, mode), JSON.stringify(options))
  }, [eventId, mode, options])

  function addOption(label) {
    const trimmed = label.trim()
    if (!trimmed) return
    setOptions((prev) => [...prev, trimmed])
  }

  function removeOption(index) {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  function resetToDefaults() {
    setOptions(DEFAULTS[mode] ?? [])
  }

  return { options, addOption, removeOption, resetToDefaults }
}
