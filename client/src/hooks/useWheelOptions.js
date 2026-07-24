import { useCallback, useEffect, useState } from 'react'
import {
  fetchWheelOptions,
  createWheelOption,
  deleteWheelOption,
  resetWheelOptions,
} from '../lib/api.js'

/**
 * Manages the editable slice list for a given Wheel of Destiny mode,
 * stored server-side per event so every device sees the same slices
 * (see docs/new_features.txt "Multi-Wheel Engine").
 *
 * @param {number|undefined} eventId
 * @param {'penalty'|'challenge'|'custom'} mode
 */
export function useWheelOptions(eventId, mode) {
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(eventId))

  const refresh = useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      setOptions(await fetchWheelOptions(eventId, mode))
    } finally {
      setIsLoading(false)
    }
  }, [eventId, mode])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addOption(label) {
    const trimmed = label.trim()
    if (!trimmed || !eventId) return
    await createWheelOption({ event_id: eventId, mode, label: trimmed })
    await refresh()
  }

  async function removeOption(id) {
    await deleteWheelOption(id)
    await refresh()
  }

  async function resetToDefaults() {
    if (!eventId) return
    await resetWheelOptions(eventId, mode)
    await refresh()
  }

  return { options, isLoading, addOption, removeOption, resetToDefaults }
}
