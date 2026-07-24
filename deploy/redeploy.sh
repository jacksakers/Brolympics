#!/usr/bin/env bash
set -euo pipefail

# Quickly rebuilds the client and restarts the production server without
# systemd, per the "Running manually" section of the top-level README.
# Kills any existing `node index.js` server, rebuilds client/dist, and
# starts a fresh detached server process logging to /tmp/brolympics.log.
#
# Usage: ./deploy/redeploy.sh [--no-build]
#   --no-build   Skip rebuilding the client (just restart the server).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_FILE="/tmp/brolympics.log"
PORT="${PORT:-3000}"

SKIP_BUILD=false
if [[ "${1:-}" == "--no-build" ]]; then
  SKIP_BUILD=true
fi

echo "==> Stopping any running server"
pkill -f 'node index.js' 2>/dev/null || true
sleep 1

if [[ "${SKIP_BUILD}" == false ]]; then
  echo "==> Building client"
  npm run build --prefix "${PROJECT_ROOT}/client"
else
  echo "==> Skipping client build (--no-build)"
fi

echo "==> Starting server in production mode (detached)"
cd "${PROJECT_ROOT}/server"
NODE_ENV=production PORT="${PORT}" nohup node index.js > "${LOG_FILE}" 2>&1 < /dev/null &
disown

sleep 1
echo "==> Health check"
curl -s "http://localhost:${PORT}/api/health" || echo "(no response yet — check ${LOG_FILE})"
echo
echo "==> Done. Logs: tail -f ${LOG_FILE}"
