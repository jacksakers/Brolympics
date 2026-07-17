import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

/**
 * GET /api/teams?event_id=1
 * Lists all teams for an event.
 */
router.get('/', (req, res) => {
  const { event_id: eventId } = req.query

  if (!eventId) {
    return res.status(400).json({ error: 'event_id query param is required' })
  }

  const teams = db
    .prepare('SELECT * FROM teams WHERE event_id = ? ORDER BY id')
    .all(eventId)

  res.json(teams)
})

/**
 * GET /api/teams/:id
 */
router.get('/:id', (req, res) => {
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id)

  if (!team) {
    return res.status(404).json({ error: 'Team not found' })
  }

  res.json(team)
})

/**
 * POST /api/teams
 * Body: { event_id: number, name: string }
 */
router.post('/', (req, res) => {
  const { event_id: eventId, name } = req.body

  if (!eventId || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'event_id and name are required' })
  }

  const { lastInsertRowid } = db
    .prepare('INSERT INTO teams (event_id, name) VALUES (?, ?)')
    .run(eventId, name.trim())

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(lastInsertRowid)
  res.status(201).json(team)
})

/**
 * PUT /api/teams/:id
 * Body: { name: string }
 */
router.put('/:id', (req, res) => {
  const { name } = req.body

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required' })
  }

  const result = db
    .prepare('UPDATE teams SET name = ? WHERE id = ?')
    .run(name.trim(), req.params.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Team not found' })
  }

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id)
  res.json(team)
})

/**
 * DELETE /api/teams/:id
 */
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Team not found' })
  }

  res.status(204).end()
})

export default router
