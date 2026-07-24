import { Router } from 'express'
import db from '../db/index.js'

const router = Router()
const VALID_FORMATS = new Set(['team', 'individual'])

/**
 * GET /api/games?event_id=1
 * Lists all games for an event.
 */
router.get('/', (req, res) => {
  const { event_id: eventId } = req.query

  if (!eventId) {
    return res.status(400).json({ error: 'event_id query param is required' })
  }

  const games = db
    .prepare('SELECT * FROM games WHERE event_id = ? ORDER BY id')
    .all(eventId)

  res.json(games)
})

/**
 * GET /api/games/:id
 */
router.get('/:id', (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id)

  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  res.json(game)
})

/**
 * POST /api/games
 * Body: { event_id: number, name: string, format: 'team'|'individual', points_config?: object, rules?: string, image_url?: string }
 */
router.post('/', (req, res) => {
  const {
    event_id: eventId,
    name,
    format,
    points_config: pointsConfig = null,
    rules = null,
    image_url: imageUrl = null,
  } = req.body

  if (!eventId || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'event_id and name are required' })
  }

  if (!VALID_FORMATS.has(format)) {
    return res.status(400).json({ error: "format must be 'team' or 'individual'" })
  }

  const { lastInsertRowid } = db
    .prepare(
      'INSERT INTO games (event_id, name, format, points_config, rules, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(
      eventId,
      name.trim(),
      format,
      pointsConfig ? JSON.stringify(pointsConfig) : null,
      rules,
      imageUrl,
    )

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(lastInsertRowid)
  res.status(201).json(game)
})

/**
 * Validates a turn_order payload: must be an array of positive integers
 * (team/player ids), or null to clear it.
 */
function isValidTurnOrder(value) {
  return value === null || (Array.isArray(value) && value.every((id) => Number.isInteger(id)))
}

/**
 * PUT /api/games/:id
 * Body: { name?: string, format?: 'team'|'individual', points_config?: object, rules?: string, image_url?: string }
 */
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id)

  if (!existing) {
    return res.status(404).json({ error: 'Game not found' })
  }

  const name = typeof req.body.name === 'string' ? req.body.name.trim() : existing.name
  const format = VALID_FORMATS.has(req.body.format) ? req.body.format : existing.format
  const pointsConfig =
    'points_config' in req.body
      ? req.body.points_config
        ? JSON.stringify(req.body.points_config)
        : null
      : existing.points_config
  const rules = 'rules' in req.body ? req.body.rules : existing.rules
  const imageUrl = 'image_url' in req.body ? req.body.image_url : existing.image_url

  if ('turn_order' in req.body && !isValidTurnOrder(req.body.turn_order)) {
    return res.status(400).json({ error: 'turn_order must be an array of ids, or null' })
  }
  const turnOrder =
    'turn_order' in req.body
      ? req.body.turn_order
        ? JSON.stringify(req.body.turn_order)
        : null
      : existing.turn_order

  db.prepare(
    'UPDATE games SET name = ?, format = ?, points_config = ?, rules = ?, image_url = ?, turn_order = ? WHERE id = ?',
  ).run(name, format, pointsConfig, rules, imageUrl, turnOrder, req.params.id)

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id)
  res.json(game)
})

/**
 * DELETE /api/games/:id
 */
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Game not found' })
  }

  res.status(204).end()
})

export default router
