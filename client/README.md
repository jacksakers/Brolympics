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

- `src/App.jsx` — root component.
- `src/main.jsx` — React entry point.
- `src/index.css` — Tailwind entry point (`@import "tailwindcss";`).

Routing, hooks, and dashboard components are added in later phases per
[docs/implementation_plan.md](../docs/implementation_plan.md).

