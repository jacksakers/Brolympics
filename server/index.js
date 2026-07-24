import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import db from './db/index.js'
import eventsRouter from './routes/events.js'
import teamsRouter from './routes/teams.js'
import playersRouter from './routes/players.js'
import gamesRouter from './routes/games.js'
import transactionsRouter from './routes/transactions.js'
import reactionsRouter from './routes/reactions.js'
import uploadsRouter from './routes/uploads.js'
import wheelOptionsRouter from './routes/wheelOptions.js'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

app.use(cors())
app.use(express.json())

/**
 * Health check endpoint. Confirms the API is running and can reach the
 * SQLite database.
 */
app.get('/api/health', (req, res) => {
  const { result } = db.prepare('SELECT 1 as result').get()
  res.json({ status: 'ok', db: result === 1 })
})

app.use('/api/events', eventsRouter)
app.use('/api/teams', teamsRouter)
app.use('/api/players', playersRouter)
app.use('/api/games', gamesRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/reactions', reactionsRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/wheel-options', wheelOptionsRouter)
app.use('/uploads', express.static(uploadsDir))

// In production, serve the built Vite client as static assets.
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Brolympics server listening on port ${PORT}`)
})
