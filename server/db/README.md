# db

SQLite database connection for the Brolympics server, using
`better-sqlite3`.

## Purpose

- `index.js` opens (and creates, if missing) the SQLite database file and
  exports a shared connection used by API routes.
- The database file itself (`brolympics.sqlite3` and its WAL/journal
  files) is git-ignored — it's local, file-based storage per
  [docs/SDD.md](../../docs/SDD.md).

## Schema

The Events/Players/Teams/Games/Transactions schema and migrations are
added in Phase 2 (see
[docs/implementation_plan.md](../../docs/implementation_plan.md)).
