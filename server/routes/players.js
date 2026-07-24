import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

/**
 * GET /api/players?event_id=1
 * Lists all players for an event.
 */
router.get('/', (req, res) => {
  const { event_id: eventId } = req.query

  if (!eventId) {
    return res.status(400).json({ error: 'event_id query param is required' })
  }

  const players = db
    .prepare('SELECT * FROM players WHERE event_id = ? ORDER BY id')
    .all(eventId)

  res.json(players)
})

/**
 * GET /api/players/:id
 */
router.get('/:id', (req, res) => {
  const player = db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get(req.params.id)

  if (!player) {
    return res.status(404).json({ error: 'Player not found' })
  }

  res.json(player)
})

/**
 * POST /api/players
 * Body: { event_id: number, name: string, team_id?: number }
 */
router.post('/', (req, res) => {
  const { event_id: eventId, name, team_id: teamId = null } = req.body

  if (!eventId || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'event_id and name are required' })
  }

  const { lastInsertRowid } = db
    .prepare('INSERT INTO players (event_id, name, team_id) VALUES (?, ?, ?)')
    .run(eventId, name.trim(), teamId)

  const player = db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get(lastInsertRowid)
  res.status(201).json(player)
})

/**
 * PUT /api/players/:id
 * Body: { name?: string, team_id?: number|null, image_url?: string|null }
 */
router.put('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get(req.params.id)

  if (!existing) {
    return res.status(404).json({ error: 'Player not found' })
  }

  const name = typeof req.body.name === 'string' ? req.body.name.trim() : existing.name
  const teamId = 'team_id' in req.body ? req.body.team_id : existing.team_id
  const imageUrl = 'image_url' in req.body ? req.body.image_url : existing.image_url

  db.prepare('UPDATE players SET name = ?, team_id = ?, image_url = ? WHERE id = ?').run(
    name,
    teamId,
    imageUrl,
    req.params.id,
  )

  const player = db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get(req.params.id)
  res.json(player)
})

/**
 * DELETE /api/players/:id
 */
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM players WHERE id = ?').run(req.params.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Player not found' })
  }

  res.status(204).end()
})

export default router
