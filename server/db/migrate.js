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
  // We use PRAGMA table_info to detect existing columns rather than
  // relying on error-message text matching, which can vary across
  // SQLite versions and locales.
  const columnsToAdd = [
    { table: 'games', column: 'rules', definition: 'TEXT' },
    { table: 'games', column: 'image_url', definition: 'TEXT' },
    { table: 'players', column: 'image_url', definition: 'TEXT' },
    { table: 'transactions', column: 'image_url', definition: 'TEXT' },
  ]
  for (const { table, column, definition } of columnsToAdd) {
    const existing = db.prepare(`PRAGMA table_info(${table})`).all()
    const alreadyExists = existing.some((col) => col.name === column)
    if (!alreadyExists) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run()
    }
  }
}
