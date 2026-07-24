import { useCallback, useEffect, useState } from 'react'
import { fetchReactions, toggleReaction } from '../lib/api.js'

/**
 * Fetches and manages emoji reactions for an event's transactions,
 * exposing a toggle action that refetches so the History feed always
 * reflects the database (see docs/coding_guidelines.md §4 "Stateless
 * Frontend").
 *
 * @param {number|undefined} eventId
 */
export function useReactions(eventId) {
  const [reactions, setReactions] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(eventId))

  const refresh = useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      setReactions(await fetchReactions(eventId))
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function react(transactionId, playerId, emoji) {
    await toggleReaction({ transaction_id: transactionId, player_id: playerId, emoji })
    await refresh()
  }

  return { reactions, isLoading, react }
}
