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
  //
  // Table and column names come from a hardcoded allowlist here (never
  // user input), but we validate against it as a defense-in-depth
  // measure so accidental modifications can't introduce SQL injection.
  const ALLOWED_TABLES = new Set(['games', 'players', 'transactions'])
  const ALLOWED_COLUMNS = new Set(['rules', 'image_url', 'created_by_player_id', 'turn_order'])
  const ALLOWED_DEFINITIONS = new Set(['TEXT', 'INTEGER'])

  const columnsToAdd = [
    { table: 'games', column: 'rules', definition: 'TEXT' },
    { table: 'games', column: 'image_url', definition: 'TEXT' },
    { table: 'games', column: 'turn_order', definition: 'TEXT' },
    { table: 'players', column: 'image_url', definition: 'TEXT' },
    { table: 'transactions', column: 'image_url', definition: 'TEXT' },
    { table: 'transactions', column: 'created_by_player_id', definition: 'INTEGER' },
  ]
  for (const { table, column, definition } of columnsToAdd) {
    if (
      !ALLOWED_TABLES.has(table) ||
      !ALLOWED_COLUMNS.has(column) ||
      !ALLOWED_DEFINITIONS.has(definition)
    ) {
      throw new Error(
        `Blocked unexpected migration: ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
      )
    }
    const existingCols = db.prepare(`PRAGMA table_info(${table})`).all()
    const alreadyExists = existingCols.some((col) => col.name === column)
    if (!alreadyExists) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run()
    }
  }
}
