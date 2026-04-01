#!/usr/bin/env bash
# deploy.sh — Build and deploy the Linear Clone app to a DigitalOcean droplet.
#
# Usage:
#   ./deploy.sh <droplet-ip>
#
# Requirements (local):
#   - SSH access to the droplet as root (your ~/.ssh/id_ed25519 key must be
#     registered in DigitalOcean or added to the droplet's authorized_keys)
#   - rsync installed locally
#
# What it does:
#   1. Installs Docker + Docker Compose plugin on the remote server (idempotent)
#   2. Rsyncs the project source to /opt/linear-clone on the server
#   3. Builds and starts the production stack with docker compose
#   4. Prints the public URL when ready

set -euo pipefail

DROPLET_IP="${1:-}"
if [[ -z "$DROPLET_IP" ]]; then
  echo "Usage: $0 <droplet-ip>" >&2
  exit 1
fi

SSH="ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 root@${DROPLET_IP}"
REMOTE_DIR="/opt/linear-clone"

echo "==> Deploying to ${DROPLET_IP}..."

# ── 1. Install Docker (idempotent) ─────────────────────────────────────────
echo "==> Installing Docker on remote server..."
$SSH bash -s <<'REMOTE'
set -euo pipefail
if ! command -v docker &>/dev/null; then
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  echo "Docker installed."
else
  echo "Docker already installed: $(docker --version)"
fi
REMOTE

# ── 2. Rsync source code ────────────────────────────────────────────────────
echo "==> Syncing source code to ${REMOTE_DIR}..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
rsync -az --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='*.log' \
  -e "ssh -o StrictHostKeyChecking=accept-new" \
  "${SCRIPT_DIR}/" "root@${DROPLET_IP}:${REMOTE_DIR}/"

# ── 3. Build & start containers ─────────────────────────────────────────────
echo "==> Building and starting containers..."
$SSH bash -s <<REMOTE
set -euo pipefail
cd ${REMOTE_DIR}
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
REMOTE

# ── 4. Health check ──────────────────────────────────────────────────────────
echo "==> Waiting for app to become healthy..."
for i in $(seq 1 30); do
  if curl -sf "http://${DROPLET_IP}/" >/dev/null 2>&1; then
    echo ""
    echo "✓ App is live at: http://${DROPLET_IP}"
    exit 0
  fi
  printf "."
  sleep 3
done

echo ""
echo "Warning: App did not respond after 90 seconds."
echo "Check logs with:"
echo "  ssh root@${DROPLET_IP} 'docker compose -f ${REMOTE_DIR}/docker-compose.prod.yml logs --tail=50'"
exit 1
