import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

/**
 * GET /api/transactions?event_id=1
 * Lists all transactions for an event, newest first, for the
 * History/Audit Log and leaderboard calculations.
 */
router.get('/', (req, res) => {
  const { event_id: eventId } = req.query

  if (!eventId) {
    return res.status(400).json({ error: 'event_id query param is required' })
  }

  const transactions = db
    .prepare('SELECT * FROM transactions WHERE event_id = ? ORDER BY id DESC')
    .all(eventId)

  res.json(transactions)
})

/**
 * POST /api/transactions
 * Records a score or bonus point transaction. Exactly one of
 * player_id/team_id should be set depending on the game's format (or for
 * a freeform bonus award).
 * Body: { event_id, player_id?, team_id?, game_id?, points, reason }
 */
router.post('/', (req, res) => {
  const {
    event_id: eventId,
    player_id: playerId = null,
    team_id: teamId = null,
    game_id: gameId = null,
    points,
    reason,
  } = req.body

  if (!eventId) {
    return res.status(400).json({ error: 'event_id is required' })
  }
  if (!playerId && !teamId) {
    return res.status(400).json({ error: 'player_id or team_id is required' })
  }
  if (typeof points !== 'number' || !Number.isFinite(points)) {
    return res.status(400).json({ error: 'points must be a number' })
  }
  if (typeof reason !== 'string' || reason.trim() === '') {
    return res.status(400).json({ error: 'reason is required' })
  }

  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO transactions (event_id, player_id, team_id, game_id, points, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(eventId, playerId, teamId, gameId, points, reason.trim())

  const transaction = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(lastInsertRowid)
  res.status(201).json(transaction)
})

/**
 * POST /api/transactions/:id/revert
 * Per the coding guidelines, transactions are never deleted. Reverting
 * inserts a new compensating transaction with negated points, preserving
 * the full audit trail.
 */
router.post('/:id/revert', (req, res) => {
  const original = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(req.params.id)

  if (!original) {
    return res.status(404).json({ error: 'Transaction not found' })
  }

  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO transactions
         (event_id, player_id, team_id, game_id, points, reason, reverts_transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      original.event_id,
      original.player_id,
      original.team_id,
      original.game_id,
      -original.points,
      `Reverted: ${original.reason}`,
      original.id,
    )

  const reversal = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(lastInsertRowid)
  res.status(201).json(reversal)
})

export default router
