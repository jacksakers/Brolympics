import { useCallback, useEffect, useState } from 'react'
import { createTeam, deleteTeam, fetchTeams, updateTeam } from '../lib/api.js'

/**
 * Fetches and manages teams for an event, exposing CRUD actions that
 * refetch the list so the UI always reflects the database (see
 * docs/coding_guidelines.md §4 "Stateless Frontend").
 *
 * @param {number|undefined} eventId
 */
export function useTeams(eventId) {
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(eventId))
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      const data = await fetchTeams(eventId)
      setTeams(data)
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

  async function addTeam(name) {
    await createTeam({ event_id: eventId, name })
    await refresh()
  }

  async function renameTeam(id, name) {
    await updateTeam(id, { name })
    await refresh()
  }

  async function removeTeam(id) {
    await deleteTeam(id)
    await refresh()
  }

  return { teams, isLoading, error, addTeam, renameTeam, removeTeam }
}
