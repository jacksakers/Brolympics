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
- `src/context/PlayerIdentityContext.jsx` — the "Who Am I?" device
  identity (localStorage per event, see docs/new_features.txt #1):
  which player this phone belongs to, used to attribute logged scores
  (`created_by_player_id`) and reactions. `WhoAmIModal.jsx` is the
  picker UI; an avatar chip in `DashboardLayout` reopens it to switch.
- `src/lib/api.js` — thin fetch wrapper for the `/api` backend, including
  CRUD calls for teams/players/games, reactions, and image uploads.
- `src/hooks/useTeams.js`, `usePlayers.js`, `useGames.js` — data fetching
  + CRUD actions per resource, each refetching from the server after a
  mutation (stateless frontend, per
  [docs/coding_guidelines.md](../docs/coding_guidelines.md)).
- `src/hooks/useReactions.js` — emoji reactions on History feed entries.
- `src/hooks/useWheelOptions.js` — editable, per-event slice lists for
  the Wheel of Destiny (`src/pages/WheelPage.jsx` +
  `src/components/wheel/SpinningWheel.jsx`), covering Penalty,
  Challenge, Tiebreaker (auto-computed from leaderboard ties), and
  Custom modes.
- `src/utils/compressImage.js` — client-side photo compression (canvas)
  before upload, so phone camera photos stay small over Tailscale
  Funnel.
- `src/utils/generateBalancedTeams.js` — snake-draft team balancing used
  by `src/components/settings/TeamGeneratorPanel.jsx`.
- `src/layouts/DashboardLayout.jsx` — guards `/event/*` routes, redirects
  to `/` if there's no valid active event, renders `BottomNav` + tab
  content, and hosts the `PlayerIdentityProvider`.
- `src/pages/` — `LandingPage` (create/join) and one page per dashboard
  tab (`LeaderboardPage`, `GamesPage`, `BonusPage`, `WheelPage`,
  `HistoryPage`, `SettingsPage`).
- `src/components/settings/` — `PlayersSection` (incl. avatar photo
  upload), `TeamsSection`, `TeamGeneratorPanel` (balanced/random team
  split), `GamesSection` (CRUD UI), and `TurnOrderPanel` (client-side
  random turn order, not persisted), composed in `SettingsPage`.
- `src/components/PhotoAttach.jsx` — reusable "attach proof photo"
  control (compress + upload) used by `BonusPage` and `GameScoreForm`.
- `src/components/ReactionBar.jsx` — emoji reactions for a History
  entry, gated on having picked a "Who Am I?" identity.
- `src/utils/generateTurnOrder.js` — Fisher-Yates shuffle helper.

Scoring and leaderboard calculations live in
[src/utils/calculateScores.js](src/utils/calculateScores.js); see
[docs/implementation_plan.md](../docs/implementation_plan.md) for how the
app was built, phase by phase.

