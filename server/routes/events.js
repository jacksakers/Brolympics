import { Router } from 'express'
import db from '../db/index.js'
import { generateUniqueEventCode } from '../utils/generateEventCode.js'

const router = Router()

/**
 * POST /api/events
 * Creates a new event with a freshly generated, unique secret code.
 * Body: { name: string }
 */
router.post('/', (req, res) => {
  const { name } = req.body

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required' })
  }

  const secretCode = generateUniqueEventCode(db)
  const { lastInsertRowid } = db
    .prepare('INSERT INTO events (name, secret_code) VALUES (?, ?)')
    .run(name.trim(), secretCode)

  const event = db
    .prepare('SELECT * FROM events WHERE id = ?')
    .get(lastInsertRowid)

  res.status(201).json(event)
})

/**
 * GET /api/events/code/:code
 * Looks up an event by its secret code. Used by the "Join Event" flow to
 * validate a code before storing it in localStorage.
 */
router.get('/code/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase()
  const event = db
    .prepare('SELECT * FROM events WHERE secret_code = ?')
    .get(code)

  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }

  res.json(event)
})

/**
 * GET /api/events/:id
 * Fetches an event by its numeric id.
 */
router.get('/:id', (req, res) => {
  const event = db
    .prepare('SELECT * FROM events WHERE id = ?')
    .get(req.params.id)

  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }

  res.json(event)
})

/**
 * PUT /api/events/:id
 * Updates an event's name.
 * Body: { name: string }
 */
router.put('/:id', (req, res) => {
  const { name } = req.body

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required' })
  }

  const existing = db
    .prepare('SELECT * FROM events WHERE id = ?')
    .get(req.params.id)

  if (!existing) {
    return res.status(404).json({ error: 'Event not found' })
  }

  db.prepare('UPDATE events SET name = ? WHERE id = ?').run(name.trim(), req.params.id)

  const event = db
    .prepare('SELECT * FROM events WHERE id = ?')
    .get(req.params.id)

  res.json(event)
})

export default router
