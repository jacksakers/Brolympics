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
}
