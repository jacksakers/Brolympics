# Client

React (Vite) + Tailwind CSS frontend for Brolympics.

## Purpose

Mobile-first UI for creating/joining events, tracking scores, managing
players/teams/games, and viewing the live leaderboard. See
[docs/SDD.md](../docs/SDD.md) for the full feature spec.

## Running locally

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies requests to
`/api/*` to the backend server (expected on `http://localhost:3000`, see
[../server](../server)).

## Building for production

```bash
npm run build
```

Outputs static assets to `dist/`, which the server serves in production.

## Structure

- `src/App.jsx` — route definitions, wrapped in `EventProvider`.
- `src/main.jsx` — React entry point, wraps `App` in `BrowserRouter`.
- `src/index.css` — Tailwind entry point (`@import "tailwindcss";`).
- `src/context/EventContext.jsx` — global event state (create/join/leave),
  backed by `src/hooks/useEventCode.js` (localStorage persistence per
  docs/SDD.md §3).
- `src/lib/api.js` — thin fetch wrapper for the `/api` backend, including
  CRUD calls for teams/players/games.
- `src/hooks/useTeams.js`, `usePlayers.js`, `useGames.js` — data fetching
  + CRUD actions per resource, each refetching from the server after a
  mutation (stateless frontend, per
  [docs/coding_guidelines.md](../docs/coding_guidelines.md)).
- `src/layouts/DashboardLayout.jsx` — guards `/event/*` routes, redirects
  to `/` if there's no valid active event, renders `BottomNav` + tab
  content.
- `src/pages/` — `LandingPage` (create/join) and one page per dashboard
  tab (`LeaderboardPage`, `GamesPage`, `BonusPage`, `HistoryPage`,
  `SettingsPage`).
- `src/components/settings/` — `PlayersSection`, `TeamsSection`,
  `GamesSection` (CRUD UI) and `TurnOrderPanel` (client-side random turn
  order, not persisted), composed in `SettingsPage`.
- `src/utils/generateTurnOrder.js` — Fisher-Yates shuffle helper.

Scoring, leaderboard calculations, and history/undo UI are added in
Phase 5 per [docs/implementation_plan.md](../docs/implementation_plan.md).

