import { useCallback, useEffect, useState } from 'react'
import { createGame, deleteGame, fetchGames, updateGame } from '../lib/api.js'

/**
 * Fetches and manages games for an event, exposing CRUD actions that
 * refetch the list so the UI always reflects the database (see
 * docs/coding_guidelines.md §4 "Stateless Frontend").
 *
 * @param {number|undefined} eventId
 */
export function useGames(eventId) {
  const [games, setGames] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(eventId))
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      const data = await fetchGames(eventId)
      setGames(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addGame(name, format, pointsConfig = null) {
    await createGame({ event_id: eventId, name, format, points_config: pointsConfig })
    await refresh()
  }

  async function editGame(id, data) {
    await updateGame(id, data)
    await refresh()
  }

  async function removeGame(id) {
    await deleteGame(id)
    await refresh()
  }

  return { games, isLoading, error, addGame, editGame, removeGame }
}
