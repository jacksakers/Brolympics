-- Brolympics SQLite schema.
-- Applied automatically on server startup by db/migrate.js.
-- Keep statements idempotent (IF NOT EXISTS) so this can run every boot.

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  secret_code TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- format: 'team' scores are awarded to a team_id, 'individual' scores are
-- awarded to a player_id. points_config is a free-form JSON string (e.g.
-- placement -> points) interpreted by the client.
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('team', 'individual')),
  points_config TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Every score/bonus is a transaction. Reverting never deletes a row;
-- instead a new transaction with negated points is inserted and linked via
-- reverts_transaction_id, preserving a full audit trail.
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players (id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams (id) ON DELETE CASCADE,
  game_id INTEGER REFERENCES games (id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reverts_transaction_id INTEGER REFERENCES transactions (id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (player_id IS NOT NULL OR team_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_teams_event ON teams (event_id);
CREATE INDEX IF NOT EXISTS idx_players_event ON players (event_id);
CREATE INDEX IF NOT EXISTS idx_games_event ON games (event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event ON transactions (event_id);
