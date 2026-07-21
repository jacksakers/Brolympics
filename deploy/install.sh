#!/usr/bin/env bash
set -euo pipefail

# Installs Brolympics as a systemd service on this machine, per
# docs/implementation_plan.md Phase 6. Run from anywhere; it resolves
# paths relative to this script's location. Must be run with sudo (it
# writes to /etc/systemd/system and calls systemctl).
#
# Usage: sudo ./deploy/install.sh
#
# npm/node steps run as the invoking (non-root) user via a login shell,
# not as root, so nvm-managed Node installs (~/.nvm, invisible to root)
# are picked up correctly instead of falling back to root's system Node.

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root: sudo ./deploy/install.sh" >&2
  exit 1
fi

if [[ -z "${SUDO_USER:-}" ]]; then
  echo "Please run via sudo as your normal user: sudo ./deploy/install.sh" >&2
  echo "(running as the actual root account isn't supported, since nvm-managed" >&2
  echo "Node installs are per-user and root's PATH won't see them)" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUN_AS_USER="${SUDO_USER}"
SERVICE_NAME="brolympics"
SERVICE_DEST="/etc/systemd/system/${SERVICE_NAME}.service"

# Runs a command as the invoking user with a login shell, explicitly
# sourcing nvm if present. A plain `bash -lc` login shell is NOT enough:
# nvm's init lines live in ~/.bashrc, and Ubuntu/Debian's ~/.bashrc
# starts with a guard that skips the rest of the file for non-interactive
# shells (which `bash -lc` is), so nvm would silently never load and
# `node`/`npm` would resolve to root's/system's PATH instead.
run_as_user() {
  sudo -u "${RUN_AS_USER}" -H bash -lc '
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    if [ -s "$NVM_DIR/nvm.sh" ]; then
      \. "$NVM_DIR/nvm.sh"
    fi
    '"$1"
}

echo "==> Checking Node.js version as ${RUN_AS_USER}"
NODE_MAJOR="$(run_as_user 'node -p "process.versions.node.split(\".\")[0]"' 2>/dev/null || echo 0)"
REQUIRED_NODE_MAJOR=20
if [[ "${NODE_MAJOR}" -lt "${REQUIRED_NODE_MAJOR}" ]]; then
  FOUND_VERSION="$(run_as_user 'node -v' 2>/dev/null || echo 'not found')"
  echo "Brolympics requires Node.js >= ${REQUIRED_NODE_MAJOR} for user ${RUN_AS_USER} (found ${FOUND_VERSION})." >&2
  echo "Install/select a newer Node as ${RUN_AS_USER} (e.g. 'nvm install 20') and re-run this script." >&2
  exit 1
fi

# A previous run may have executed npm as root (e.g. before this script
# ran build steps as $SUDO_USER), leaving root-owned files under
# node_modules that ${RUN_AS_USER} can't clean up. Reclaim ownership of
# any pre-existing install dirs so npm ci can freely replace them.
RUN_AS_GROUP="$(id -gn "${RUN_AS_USER}")"
for dir in "${PROJECT_ROOT}/client/node_modules" "${PROJECT_ROOT}/server/node_modules"; do
  if [[ -d "${dir}" ]]; then
    chown -R "${RUN_AS_USER}:${RUN_AS_GROUP}" "${dir}"
  fi
done

echo "==> Installing client dependencies and building the frontend"
run_as_user "cd '${PROJECT_ROOT}/client' && npm ci && npm run build"

echo "==> Installing server production dependencies"
run_as_user "cd '${PROJECT_ROOT}/server' && npm ci --omit=dev"

if [[ ! -f "${PROJECT_ROOT}/server/.env" ]]; then
  echo "==> Creating server/.env"
  printf 'PORT=3000\nNODE_ENV=production\n' > "${PROJECT_ROOT}/server/.env"
  chown "${RUN_AS_USER}" "${PROJECT_ROOT}/server/.env"
fi

NODE_BIN="$(run_as_user 'command -v node')"

echo "==> Writing ${SERVICE_DEST} (User=${RUN_AS_USER}, WorkingDirectory=${PROJECT_ROOT}/server, Node=${NODE_BIN})"
sed \
  -e "s#your_linux_username#${RUN_AS_USER}#" \
  -e "s#/path/to/your/brolympics/project/server#${PROJECT_ROOT}/server#" \
  -e "s#/path/to/node_binary/node#${NODE_BIN}#" \
  "${SCRIPT_DIR}/brolympics.service" > "${SERVICE_DEST}"

echo "==> Reloading systemd and enabling the service"
systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}"

echo "==> Done. Check status with: systemctl status ${SERVICE_NAME}"
echo "    Tail logs with:          journalctl -u ${SERVICE_NAME} -f"
echo "    Expose it publicly with: sudo tailscale funnel 3000"

