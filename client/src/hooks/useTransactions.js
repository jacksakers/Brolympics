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
 * @param {{pageSize?: number}} [options] - when `pageSize` is set, only
 *   the most recent page of transactions is fetched/kept in state, and
 *   `loadMore()`/`hasMore` are available to page through older entries.
 *   This is used by the History feed, which can otherwise grow to
 *   hundreds of photo-laden entries and feel slow to load over a slow
 *   network. Omit it to fetch the full list, as callers computing
 *   totals (Leaderboard, team generator, wheel weighting) still need
 *   every transaction.
 */
export function useTransactions(eventId, { pageSize } = {}) {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(eventId))
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      if (pageSize) {
        // Fetch one extra row so we know whether an older page exists,
        // without a separate count query.
        const data = await fetchTransactions(eventId, { limit: pageSize + 1, offset: 0 })
        setHasMore(data.length > pageSize)
        setTransactions(data.slice(0, pageSize))
      } else {
        const data = await fetchTransactions(eventId)
        setTransactions(data)
      }
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [eventId, pageSize])

  useEffect(() => {
    refresh()
  }, [refresh])

  const loadMore = useCallback(async () => {
    if (!eventId || !pageSize) return
    setIsLoadingMore(true)
    try {
      const data = await fetchTransactions(eventId, {
        limit: pageSize + 1,
        offset: transactions.length,
      })
      setHasMore(data.length > pageSize)
      setTransactions((prev) => [...prev, ...data.slice(0, pageSize)])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingMore(false)
    }
  }, [eventId, pageSize, transactions.length])

  /** @param {{player_id?: number|null, team_id?: number|null, game_id?: number|null, points: number, reason: string}} data */
  async function addTransaction(data) {
    await createTransaction({ event_id: eventId, ...data })
    await refresh()
  }

  async function undoTransaction(id) {
    await revertTransaction(id)
    await refresh()
  }

  return {
    transactions,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    addTransaction,
    undoTransaction,
  }
}
