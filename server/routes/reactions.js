import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// Small allowlist of supported emoji reactions. Rejecting anything else
// keeps the History feed's reaction bar predictable and prevents
// arbitrary text being stored under the "emoji" column.
const ALLOWED_EMOJI = new Set(['👍', '🔥', '🤡', '😂', '❤️', '🍺'])

/**
 * GET /api/reactions?event_id=1
 * Lists all reactions for every transaction belonging to an event, for
 * the History feed's reaction bar.
 */
router.get('/', (req, res) => {
  const { event_id: eventId } = req.query

  if (!eventId) {
    return res.status(400).json({ error: 'event_id query param is required' })
  }

  const reactions = db
    .prepare(
      `SELECT reactions.*
       FROM reactions
       JOIN transactions ON transactions.id = reactions.transaction_id
       WHERE transactions.event_id = ?
       ORDER BY reactions.id`,
    )
    .all(eventId)

  res.json(reactions)
})

/**
 * POST /api/reactions
 * Toggles a reaction: if the player already left this exact emoji on
 * this transaction it is removed, otherwise it is added. Body:
 * { transaction_id, player_id, emoji }
 */
router.post('/', (req, res) => {
  const { transaction_id: transactionId, player_id: playerId, emoji } = req.body

  if (!transactionId || !playerId) {
    return res.status(400).json({ error: 'transaction_id and player_id are required' })
  }
  if (!ALLOWED_EMOJI.has(emoji)) {
    return res.status(400).json({ error: 'Unsupported emoji' })
  }

  const transaction = db
    .prepare('SELECT id FROM transactions WHERE id = ?')
    .get(transactionId)
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' })
  }

  const existing = db
    .prepare(
      'SELECT id FROM reactions WHERE transaction_id = ? AND player_id = ? AND emoji = ?',
    )
    .get(transactionId, playerId, emoji)

  if (existing) {
    db.prepare('DELETE FROM reactions WHERE id = ?').run(existing.id)
    return res.json({ removed: true, transaction_id: transactionId, player_id: playerId, emoji })
  }

  const { lastInsertRowid } = db
    .prepare(
      'INSERT INTO reactions (transaction_id, player_id, emoji) VALUES (?, ?, ?)',
    )
    .run(transactionId, playerId, emoji)

  const reaction = db.prepare('SELECT * FROM reactions WHERE id = ?').get(lastInsertRowid)
  res.status(201).json({ removed: false, ...reaction })
})

export default router
