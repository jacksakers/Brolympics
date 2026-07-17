import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import db from './db/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

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
