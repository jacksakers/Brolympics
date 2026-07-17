# routes

Express routers for the Brolympics REST API. Each file owns one resource
and is mounted in [../index.js](../index.js).

## Endpoints

- `events.js` — `POST /api/events` (create + generate secret code),
  `GET /api/events/code/:code` (join lookup), `GET /api/events/:id`.
- `teams.js` — full CRUD at `/api/teams`, list via `?event_id=`.
- `players.js` — full CRUD at `/api/players`, list via `?event_id=`.
- `games.js` — full CRUD at `/api/games`, list via `?event_id=`.
- `transactions.js` — `GET /api/transactions?event_id=` (audit log /
  leaderboard source), `POST /api/transactions` (score/bonus), and
  `POST /api/transactions/:id/revert` (compensating transaction — see
  [docs/coding_guidelines.md](../../docs/coding_guidelines.md) on
  immutability of history).

## Conventions

- Every route validates required fields and returns `400`/`404` JSON
  error bodies (`{ error: string }`) rather than throwing.
- Resources are scoped to an event via `event_id`, not nested URL paths,
  to keep routers flat and independently testable.
