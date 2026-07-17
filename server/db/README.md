# db

SQLite database connection for the Brolympics server, using
`better-sqlite3`.

## Purpose

- `index.js` opens (and creates, if missing) the SQLite database file,
  runs `migrate.js` to apply the schema, and exports a shared connection
  used by API routes.
- `schema.sql` defines the `events`, `teams`, `players`, `games`, and
  `transactions` tables (see [docs/SDD.md](../../docs/SDD.md) §4.3). All
  statements are idempotent and re-applied on every server startup.
- `migrate.js` reads and executes `schema.sql` against the connection.
- The database file itself (`brolympics.sqlite3` and its WAL/journal
  files) is git-ignored — it's local, file-based storage per
  [docs/SDD.md](../../docs/SDD.md).

## Schema notes

- `transactions` is append-only: reverting a score never deletes a row,
  it inserts a compensating transaction (negated points, linked via
  `reverts_transaction_id`) per
  [docs/coding_guidelines.md](../../docs/coding_guidelines.md).
- `points_config` on `games` is stored as a JSON string and
  parsed/interpreted by the client.
