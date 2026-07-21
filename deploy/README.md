# deploy

Deployment tooling to self-host Brolympics on a Linux Mini PC as a
background service, exposed to the internet via Tailscale Funnel. See
[docs/SDD.md](../docs/SDD.md) §2 "Core Architecture" and
[docs/implementation_plan.md](../docs/implementation_plan.md) Phase 6.

## Files

- `brolympics.service` — systemd unit template. `install.sh` fills in the
  `User`, `WorkingDirectory`, and `ExecStart` node binary path
  placeholders automatically; to do it by hand, copy it to
  `/etc/systemd/system/brolympics.service` and edit those values
  yourself.
- `install.sh` — builds the client, installs production server
  dependencies, writes `server/.env` if missing, installs the systemd
  unit, and starts the service.

## Requirements

- Node.js >= 20.19 for the user you run `sudo ./deploy/install.sh` as
  (see the root [README.md](../README.md#prerequisites)).
- Run the script with `sudo` as your normal user (e.g.
  `sudo ./deploy/install.sh`), **not** logged in directly as `root`. The
  npm/build steps run as `$SUDO_USER` via a login shell so that
  per-user Node version managers like [nvm](https://github.com/nvm-sh/nvm)
  are picked up — root's own `PATH` won't see a Node installed under
  `~/.nvm` in another account's home directory. If `SUDO_USER` isn't set
  (i.e. you're really logged in as `root`), the script exits early with
  guidance instead of silently building with the wrong/missing Node.
- The generated systemd unit's `ExecStart` points at the *resolved*
  `node` binary path for that user (`command -v node`) rather than a
  hardcoded `/usr/bin/node`, since nvm-managed installs live elsewhere.

## First-time setup

```bash
sudo ./deploy/install.sh
```

This is idempotent — safe to re-run after a `git pull` to rebuild and
restart with the latest code:

```bash
git pull
sudo ./deploy/install.sh
```

## Managing the service

```bash
systemctl status brolympics     # check it's running
journalctl -u brolympics -f     # tail logs
sudo systemctl restart brolympics
sudo systemctl stop brolympics
```

## Exposing it to the internet (Tailscale Funnel)

Brolympics has no user accounts (see
[docs/SDD.md](../docs/SDD.md) §3) — anyone with the Event Code has full
access — so only funnel it once you're comfortable with that trust
model.

```bash
# One-time: install and authenticate Tailscale on this machine.
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Expose the app (running on PORT from server/.env, default 3000) to
# the public internet at https://<your-machine-name>.<tailnet>.ts.net.
sudo tailscale funnel 3000
```

Run `tailscale funnel status` to see the current funnel configuration,
and `sudo tailscale funnel --https=443 off` to stop exposing it.
