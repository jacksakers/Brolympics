#!/usr/bin/env bash
set -euo pipefail

# Installs Brolympics as a systemd service on this machine, per
# docs/implementation_plan.md Phase 6. Run from anywhere; it resolves
# paths relative to this script's location. Must be run with sudo (it
# writes to /etc/systemd/system and calls systemctl).
#
# Usage: sudo ./deploy/install.sh

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root: sudo ./deploy/install.sh" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUN_AS_USER="${SUDO_USER:-$(whoami)}"
SERVICE_NAME="brolympics"
SERVICE_DEST="/etc/systemd/system/${SERVICE_NAME}.service"

echo "==> Installing client dependencies and building the frontend"
npm ci --prefix "${PROJECT_ROOT}/client"
npm run build --prefix "${PROJECT_ROOT}/client"

echo "==> Installing server production dependencies"
npm ci --omit=dev --prefix "${PROJECT_ROOT}/server"

if [[ ! -f "${PROJECT_ROOT}/server/.env" ]]; then
  echo "==> Creating server/.env"
  printf 'PORT=3000\nNODE_ENV=production\n' > "${PROJECT_ROOT}/server/.env"
fi

echo "==> Writing ${SERVICE_DEST} (User=${RUN_AS_USER}, WorkingDirectory=${PROJECT_ROOT}/server)"
sed \
  -e "s#your_linux_username#${RUN_AS_USER}#" \
  -e "s#/path/to/your/brolympics/project/server#${PROJECT_ROOT}/server#" \
  "${SCRIPT_DIR}/brolympics.service" > "${SERVICE_DEST}"

echo "==> Reloading systemd and enabling the service"
systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}"

echo "==> Done. Check status with: systemctl status ${SERVICE_NAME}"
echo "    Tail logs with:          journalctl -u ${SERVICE_NAME} -f"
echo "    Expose it publicly with: sudo tailscale funnel 3000"
