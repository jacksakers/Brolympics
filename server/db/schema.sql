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
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- format: 'team' scores are awarded to a team_id, 'individual' scores are
-- awarded to a player_id. points_config is a free-form JSON string (e.g.
-- placement -> points) interpreted by the client. rules is a free-form
-- text description of how the game is played; image_url is an optional
-- illustrative photo/diagram. turn_order is a JSON array of team/player
-- ids (matching format) recording the last-generated turn order, shared
-- across devices and shown on the Games tab.
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('team', 'individual')),
  points_config TEXT,
  rules TEXT,
  image_url TEXT,
  turn_order TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Every score/bonus is a transaction. Reverting never deletes a row;
-- instead a new transaction with negated points is inserted and linked via
-- reverts_transaction_id, preserving a full audit trail.
-- created_by_player_id records which device/player logged the entry (the
-- "Who Am I?" local identity, see docs/new_features.txt), for attribution
-- in the History feed — independent of who the points were awarded to.
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players (id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams (id) ON DELETE CASCADE,
  game_id INTEGER REFERENCES games (id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  image_url TEXT,
  created_by_player_id INTEGER REFERENCES players (id) ON DELETE SET NULL,
  reverts_transaction_id INTEGER REFERENCES transactions (id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (player_id IS NOT NULL OR team_id IS NOT NULL)
);

-- Emoji reactions on History feed entries, keyed to the reacting player's
-- local "Who Am I?" identity. The UNIQUE constraint prevents a player
-- from spamming the same emoji on the same entry repeatedly.
CREATE TABLE IF NOT EXISTS reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL REFERENCES transactions (id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players (id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (transaction_id, player_id, emoji)
);

-- Editable slice lists for the Wheel of Destiny, shared across all
-- devices for an event (see docs/new_features.txt "Multi-Wheel Engine").
-- Tiebreaker has no stored rows — it's always computed live from the
-- leaderboard.
-- points is an optional point value (positive or negative) awarded when
-- this slice is spun, prefilled into the follow-up bonus-points popup
-- (see docs/new_features.txt "Multi-Wheel Engine"); NULL means no
-- default (the popup starts blank).
CREATE TABLE IF NOT EXISTS wheel_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('penalty', 'challenge', 'custom')),
  label TEXT NOT NULL,
  points INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Quick-fill point presets (label + point value) for the Bonus page,
-- shared across all devices for an event.
CREATE TABLE IF NOT EXISTS point_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  points INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_teams_event ON teams (event_id);
CREATE INDEX IF NOT EXISTS idx_players_event ON players (event_id);
CREATE INDEX IF NOT EXISTS idx_games_event ON games (event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event ON transactions (event_id);
CREATE INDEX IF NOT EXISTS idx_reactions_transaction ON reactions (transaction_id);
CREATE INDEX IF NOT EXISTS idx_wheel_options_event_mode ON wheel_options (event_id, mode);
CREATE INDEX IF NOT EXISTS idx_point_presets_event ON point_presets (event_id);
