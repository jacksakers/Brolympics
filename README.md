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

## Running manually (without systemd)

For quick mobile testing or when you'd rather not install the systemd
service, you can build and run the production server by hand. This
serves the bundled client (a handful of small, minified files) instead
of the Vite dev server's hundreds of unbundled modules, which is
dramatically faster on a phone over Tailscale/cellular.

```bash
# Build the client (outputs to client/dist).
npm run build

# Run the server in production mode so it serves client/dist. This
# blocks the terminal — use the background variant below to keep it
# running after you disconnect.
NODE_ENV=production npm start --prefix server
```

To run it detached in the background (survives closing the terminal):

```bash
cd server
NODE_ENV=production nohup node index.js > /tmp/brolympics.log 2>&1 < /dev/null &
disown
```

Check it's up and see the logs:

```bash
curl -s http://localhost:3000/api/health
tail -f /tmp/brolympics.log
```

To restart after pulling new code or rebuilding the client:

```bash
pkill -f 'node index.js'          # stop the running server
cd client && npm run build && cd ..  # rebuild if client code changed
cd server
NODE_ENV=production nohup node index.js > /tmp/brolympics.log 2>&1 < /dev/null &
disown
```

Or just run [deploy/redeploy.sh](deploy/redeploy.sh), which does all of the
above in one step (pass `--no-build` to skip rebuilding the client):

```bash
./deploy/redeploy.sh
```

### Exposing it with Tailscale Funnel

```bash
# Point the funnel at the production server (port 3000) and keep it
# running in the background (--bg), rather than the foreground mode
# that stops funneling as soon as the command exits/is interrupted.
sudo tailscale funnel --bg 3000

# Check what's currently funneled.
tailscale funnel status

# Stop funneling.
sudo tailscale funnel --https=443 off
```

