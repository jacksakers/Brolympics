import { useCallback, useEffect, useState } from 'react'
import { createGame, deleteGame, fetchGames, updateGame } from '../lib/api.js'

/**
 * Parses a game's `turn_order` column (a JSON array of team/player ids,
 * or null) into a plain array for the client.
 */
function parseTurnOrder(game) {
  if (!game.turn_order) return { ...game, turn_order: null }
  try {
    return { ...game, turn_order: JSON.parse(game.turn_order) }
  } catch {
    return { ...game, turn_order: null }
  }
}

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
      setGames(data.map(parseTurnOrder))
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

  /** Persists a newly-generated turn order (array of team/player ids). */
  async function saveTurnOrder(id, entrantIds) {
    await editGame(id, { turn_order: entrantIds })
  }

  return { games, isLoading, error, addGame, editGame, removeGame, saveTurnOrder }
}

