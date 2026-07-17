import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { migrate } from './migrate.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Single shared SQLite connection for the whole server. better-sqlite3 is
// synchronous and safe to share across requests within one Node process.
const dbPath = process.env.DB_PATH || path.join(__dirname, 'brolympics.sqlite3')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

migrate(db)

export default db
