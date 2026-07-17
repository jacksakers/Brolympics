import { useCallback, useEffect, useState } from 'react'
import {
  createTransaction,
  fetchTransactions,
  revertTransaction,
} from '../lib/api.js'

/**
 * Fetches and manages score/bonus transactions for an event, exposing
 * actions that refetch the list so the UI always reflects the database
 * (see docs/coding_guidelines.md §4 "Stateless Frontend"). Transactions
 * are never deleted client-side either — reverting posts a compensating
 * transaction (see docs/coding_guidelines.md §4 "Immutability in
 * History").
 *
 * @param {number|undefined} eventId
 */
export function useTransactions(eventId) {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(eventId))
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      const data = await fetchTransactions(eventId)
      setTransactions(data)
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

  /** @param {{player_id?: number|null, team_id?: number|null, game_id?: number|null, points: number, reason: string}} data */
  async function addTransaction(data) {
    await createTransaction({ event_id: eventId, ...data })
    await refresh()
  }

  async function undoTransaction(id) {
    await revertTransaction(id)
    await refresh()
  }

  return { transactions, isLoading, error, addTransaction, undoTransaction }
}
