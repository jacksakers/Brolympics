import { Router } from 'express'
import db from '../db/index.js'

const router = Router()
const VALID_MODES = new Set(['penalty', 'challenge', 'custom'])

// Starter slices so the wheel is fun out of the box; used to repopulate
// a mode when a group resets it. Custom always resets to empty since
// it's for spontaneous bets.
const DEFAULTS = {
  penalty: [
    'Drink a mystery mix',
    'Play next game left-handed',
    'Wear the Shame Hat',
    '15 pushups, right now',
    'Sing your entrance song',
    'Give up your seat',
  ],
  challenge: [
    'Trick shot (+50 pts)',
    'Call family, explain the app (+30 pts)',
    'Chug water in 10s (+20 pts)',
    'High-five 3 strangers (+15 pts)',
    'Freestyle rap (+25 pts)',
  ],
  custom: [],
}

/**
 * GET /api/wheel-options?event_id=1&mode=penalty
 * Lists wheel slice options for an event, optionally filtered to one
 * mode. Shared across all devices for the event.
 */
router.get('/', (req, res) => {
  const { event_id: eventId, mode } = req.query

  if (!eventId) {
    return res.status(400).json({ error: 'event_id query param is required' })
  }
  if (mode !== undefined && !VALID_MODES.has(mode)) {
    return res.status(400).json({ error: 'mode must be penalty, challenge, or custom' })
  }

  const options = mode
    ? db
        .prepare(
          'SELECT * FROM wheel_options WHERE event_id = ? AND mode = ? ORDER BY position, id',
        )
        .all(eventId, mode)
    : db
        .prepare('SELECT * FROM wheel_options WHERE event_id = ? ORDER BY mode, position, id')
        .all(eventId)

  res.json(options)
})

/**
 * POST /api/wheel-options
 * Body: { event_id: number, mode: 'penalty'|'challenge'|'custom', label: string,
 *   points?: number|null }
 * Appends a new slice to the end of the mode's list. `points` is an
 * optional point value (e.g. a challenge worth +25) prefilled into the
 * bonus-points popup shown when this slice is spun.
 */
router.post('/', (req, res) => {
  const { event_id: eventId, mode, label, points } = req.body

  if (!eventId || !VALID_MODES.has(mode)) {
    return res.status(400).json({ error: 'event_id and a valid mode are required' })
  }
  if (typeof label !== 'string' || label.trim() === '') {
    return res.status(400).json({ error: 'label is required' })
  }
  if (points !== undefined && points !== null && !Number.isInteger(points)) {
    return res.status(400).json({ error: 'points must be an integer or null' })
  }

  const { maxPosition } = db
    .prepare('SELECT MAX(position) as maxPosition FROM wheel_options WHERE event_id = ? AND mode = ?')
    .get(eventId, mode)

  const { lastInsertRowid } = db
    .prepare(
      'INSERT INTO wheel_options (event_id, mode, label, points, position) VALUES (?, ?, ?, ?, ?)',
    )
    .run(eventId, mode, label.trim(), points ?? null, (maxPosition ?? -1) + 1)

  const option = db.prepare('SELECT * FROM wheel_options WHERE id = ?').get(lastInsertRowid)
  res.status(201).json(option)
})

/**
 * DELETE /api/wheel-options/:id
 */
router.delete('/:id', (req, res) => {
  const { changes } = db.prepare('DELETE FROM wheel_options WHERE id = ?').run(req.params.id)

  if (changes === 0) {
    return res.status(404).json({ error: 'Wheel option not found' })
  }

  res.status(204).end()
})

/**
 * POST /api/wheel-options/reset
 * Body: { event_id: number, mode: 'penalty'|'challenge'|'custom' }
 * Clears a mode's slices and repopulates it with the built-in defaults
 * (empty for custom), for everyone viewing the event.
 */
router.post('/reset', (req, res) => {
  const { event_id: eventId, mode } = req.body

  if (!eventId || !VALID_MODES.has(mode)) {
    return res.status(400).json({ error: 'event_id and a valid mode are required' })
  }

  const insert = db.prepare(
    'INSERT INTO wheel_options (event_id, mode, label, position) VALUES (?, ?, ?, ?)',
  )
  const resetTransaction = db.transaction(() => {
    db.prepare('DELETE FROM wheel_options WHERE event_id = ? AND mode = ?').run(eventId, mode)
    DEFAULTS[mode].forEach((label, position) => insert.run(eventId, mode, label, position))
  })
  resetTransaction()

  const options = db
    .prepare('SELECT * FROM wheel_options WHERE event_id = ? AND mode = ? ORDER BY position, id')
    .all(eventId, mode)

  res.json(options)
})

export default router
