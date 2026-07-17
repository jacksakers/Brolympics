# Server

Node.js (Express) API server for Brolympics, backed by SQLite
(`better-sqlite3`).

## Purpose

Serves the REST API for events, players, teams, games, and score
transactions (see [docs/SDD.md](../docs/SDD.md)), and serves the built
client in production.

## Running locally

```bash
npm install
npm run dev
```

The server listens on `http://localhost:3000` by default (see `.env`,
`PORT`). During development the [client](../client) dev server proxies
`/api/*` requests here; CORS is also enabled for direct API calls.

## Production

```bash
NODE_ENV=production npm start
```

When `NODE_ENV=production`, the server serves the built client from
`../client/dist`.

## Structure

- `index.js` — Express app entry point, health check, static file
  serving.
- `db/` — SQLite connection and (in later phases) schema/migrations. See
  [db/README.md](db/README.md).
