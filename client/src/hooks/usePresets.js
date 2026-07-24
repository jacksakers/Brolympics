import { useCallback, useEffect, useState } from 'react'
import { fetchPresets, createPreset, deletePreset } from '../lib/api.js'

/**
 * Manages user-defined quick-award point presets (label + point value)
 * for an event, stored server-side so every device sees the same list
 * (see docs/coding_guidelines.md §4 "Stateless Frontend").
 *
 * @param {number|undefined} eventId
 */
export function usePresets(eventId) {
  const [presets, setPresets] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(eventId))

  const refresh = useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      setPresets(await fetchPresets(eventId))
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addPreset(label, points) {
    if (!eventId) return
    await createPreset({ event_id: eventId, label, points: Number(points) })
    await refresh()
  }

  async function removePreset(id) {
    await deletePreset(id)
    await refresh()
  }

  return { presets, isLoading, addPreset, removePreset }
}
