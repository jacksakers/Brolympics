import { useCallback, useEffect, useState } from 'react'
import {
  createPlayer,
  deletePlayer,
  fetchPlayers,
  updatePlayer,
} from '../lib/api.js'

/**
 * Fetches and manages players for an event, exposing CRUD actions that
 * refetch the list so the UI always reflects the database (see
 * docs/coding_guidelines.md §4 "Stateless Frontend").
 *
 * @param {number|undefined} eventId
 */
export function usePlayers(eventId) {
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(eventId))
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      const data = await fetchPlayers(eventId)
      setPlayers(data)
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

  async function addPlayer(name, teamId = null) {
    await createPlayer({ event_id: eventId, name, team_id: teamId })
    await refresh()
  }

  async function renamePlayer(id, name) {
    await updatePlayer(id, { name })
    await refresh()
  }

  async function assignPlayerTeam(id, teamId) {
    await updatePlayer(id, { team_id: teamId })
    await refresh()
  }

  async function removePlayer(id) {
    await deletePlayer(id)
    await refresh()
  }

  return {
    players,
    isLoading,
    error,
    addPlayer,
    renamePlayer,
    assignPlayerTeam,
    removePlayer,
  }
}
