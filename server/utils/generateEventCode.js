import crypto from 'node:crypto'

// Excludes visually ambiguous characters (0/O, 1/I/L) to keep codes easy to
// read aloud and type on a phone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

/**
 * Generates a random 6-character alphanumeric event code.
 *
 * @returns {string}
 */
function randomCode() {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = crypto.randomInt(ALPHABET.length)
    code += ALPHABET[index]
  }
  return code
}

/**
 * Generates a random event code guaranteed to be unique among existing
 * events in the database.
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {string}
 */
export function generateUniqueEventCode(db) {
  const existing = db.prepare('SELECT 1 FROM events WHERE secret_code = ?')
  let code = randomCode()
  while (existing.get(code)) {
    code = randomCode()
  }
  return code
}
