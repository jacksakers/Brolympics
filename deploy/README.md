# deploy

Deployment tooling to self-host Brolympics on a Linux Mini PC as a
background service, exposed to the internet via Tailscale Funnel. See
[docs/SDD.md](../docs/SDD.md) §2 "Core Architecture" and
[docs/implementation_plan.md](../docs/implementation_plan.md) Phase 6.

## Files

- `brolympics.service` — systemd unit template. `install.sh` fills in the
  `User` and `WorkingDirectory` placeholders automatically; to do it by
  hand, copy it to `/etc/systemd/system/brolympics.service` and edit
  those two values yourself.
- `install.sh` — builds the client, installs production server
  dependencies, writes `server/.env` if missing, installs the systemd
  unit, and starts the service.

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
