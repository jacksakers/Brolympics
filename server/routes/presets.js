import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

/**
 * GET /api/presets?event_id=1
 * Lists point presets for an event, for the Bonus page's quick-fill
 * buttons and the Settings page's management UI.
 */
router.get('/', (req, res) => {
  const { event_id: eventId } = req.query

  if (!eventId) {
    return res.status(400).json({ error: 'event_id query param is required' })
  }

  const presets = db
    .prepare('SELECT * FROM point_presets WHERE event_id = ? ORDER BY position, id')
    .all(eventId)

  res.json(presets)
})

/**
 * POST /api/presets
 * Body: { event_id: number, label: string, points: number }
 * Appends a new preset to the end of the event's list.
 */
router.post('/', (req, res) => {
  const { event_id: eventId, label, points } = req.body

  if (!eventId) {
    return res.status(400).json({ error: 'event_id is required' })
  }
  if (typeof label !== 'string' || label.trim() === '') {
    return res.status(400).json({ error: 'label is required' })
  }
  const pointsNum = Number(points)
  if (!Number.isFinite(pointsNum)) {
    return res.status(400).json({ error: 'points must be a number' })
  }

  const { maxPosition } = db
    .prepare('SELECT MAX(position) as maxPosition FROM point_presets WHERE event_id = ?')
    .get(eventId)

  const { lastInsertRowid } = db
    .prepare(
      'INSERT INTO point_presets (event_id, label, points, position) VALUES (?, ?, ?, ?)',
    )
    .run(eventId, label.trim(), pointsNum, (maxPosition ?? -1) + 1)

  const preset = db.prepare('SELECT * FROM point_presets WHERE id = ?').get(lastInsertRowid)
  res.status(201).json(preset)
})

/**
 * DELETE /api/presets/:id
 */
router.delete('/:id', (req, res) => {
  const { changes } = db.prepare('DELETE FROM point_presets WHERE id = ?').run(req.params.id)

  if (changes === 0) {
    return res.status(404).json({ error: 'Preset not found' })
  }

  res.status(204).end()
})

export default router
