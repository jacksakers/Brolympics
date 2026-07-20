import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Applies schema.sql against the given database connection. Safe to run
 * on every server startup since all statements are idempotent
 * (`CREATE TABLE IF NOT EXISTS`, etc).
 *
 * @param {import('better-sqlite3').Database} db
 */
export function migrate(db) {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  db.exec(schema)

  // Backfill new columns on databases created before these columns
  // existed in schema.sql. CREATE TABLE IF NOT EXISTS above is a no-op
  // for already-existing tables, so these ALTERs cover upgrades.
  // Errors (e.g. "duplicate column name") are swallowed since the
  // statements are only needed once per database.
  const alterStatements = [
    'ALTER TABLE games ADD COLUMN rules TEXT',
    'ALTER TABLE games ADD COLUMN image_url TEXT',
    'ALTER TABLE players ADD COLUMN image_url TEXT',
    'ALTER TABLE transactions ADD COLUMN image_url TEXT',
  ]
  for (const stmt of alterStatements) {
    try {
      db.prepare(stmt).run()
    } catch {
      // Column already exists - ignore
    }
  }
}
