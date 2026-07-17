# Brolympics

Self-hosted, mobile-first web app for tracking friendly multi-event
competitions — games, teams, bonus points, an audit-logged history, and a
live leaderboard. See [docs/SDD.md](docs/SDD.md) for the full design and
[docs/implementation_plan.md](docs/implementation_plan.md) for how it was
built, phase by phase.

## Structure

- [client/](client/) — React (Vite) + Tailwind CSS frontend.
- [server/](server/) — Node.js (Express) API, backed by SQLite.
- [deploy/](deploy/) — systemd service + install script for self-hosting
  on a Linux Mini PC, exposed via Tailscale Funnel.
- [docs/](docs/) — design docs and coding guidelines.

## Local development

```bash
npm run install:all
npm run dev:server   # terminal 1 — API on :3000
npm run dev:client   # terminal 2 — Vite dev server on :5173, proxies /api
```

See [client/README.md](client/README.md) and
[server/README.md](server/README.md) for details.

## Production deployment

```bash
sudo ./deploy/install.sh
```

Builds the client, installs the server as a systemd service, and prints
the command to expose it publicly via Tailscale Funnel. See
[deploy/README.md](deploy/README.md) for the full walkthrough.
