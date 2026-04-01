# Linear Clone — Production Deployment

Live URL: **http://104.236.117.190**

## Architecture

```
Internet
   │  port 80
   ▼
┌─────────────────────────────────────────────────────────────┐
│  DigitalOcean Droplet  (nyc3, s-1vcpu-2gb, Ubuntu 22.04)   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Docker Compose (production stack)                  │   │
│  │                                                     │   │
│  │  ┌─────────────┐     /api/*      ┌──────────────┐  │   │
│  │  │  frontend   │ ─────────────► │   backend    │  │   │
│  │  │  nginx:80   │                │  node:3001   │  │   │
│  │  │  (static)   │                │  (Express)   │  │   │
│  │  └─────────────┘                └──────┬───────┘  │   │
│  │                                        │           │   │
│  │                                        ▼           │   │
│  │                                 ┌─────────────┐   │   │
│  │                                 │     db      │   │   │
│  │                                 │  postgres   │   │   │
│  │                                 │   :5432     │   │   │
│  │                                 └─────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Services

| Service | Image | Port | Role |
|---------|-------|------|------|
| `frontend` | nginx:alpine + React build | 80 (public) | Serves static SPA; proxies `/api/*` to backend |
| `backend` | node:20-alpine | 3001 (internal) | Express REST API; auto-migrates DB on startup |
| `db` | postgres:16-alpine | 5432 (internal) | Persistent storage via `pgdata` named volume |

### Key design decisions

- **nginx as reverse proxy** — The React app uses relative `/api` paths. nginx serves the static build and proxies `/api/*` to the backend container, so no CORS headers or absolute URLs are needed.
- **Multi-stage Docker builds** — Both backend and frontend use builder stages that compile TypeScript/Vite, then copy only the compiled artifacts into slim runtime images (no dev deps shipped).
- **Auto-migration** — The backend runs `CREATE TABLE IF NOT EXISTS` on every startup, making it safe to redeploy without manual DB management.
- **`restart: unless-stopped`** — All services auto-restart after reboot or crash.
- **Internal networking** — Only port 80 is exposed externally. The database port is never published to the host.

---

## Files added

```
├── backend/Dockerfile.prod       # Production backend image (TS compile → node dist/)
├── frontend/Dockerfile.prod      # Production frontend image (Vite build → nginx)
├── frontend/nginx.conf           # nginx: serve static files + proxy /api to backend
├── docker-compose.prod.yml       # Production compose (no volume mounts, port 80)
└── deploy.sh                     # Deploy script (installs Docker, rsyncs, runs compose)
```

---

## Deploying

### Prerequisites

- SSH access to the server as `root` (`~/.ssh/id_ed25519` registered in DigitalOcean)
- `rsync` installed locally

### First deploy (or re-deploy)

```bash
./deploy.sh <droplet-ip>
```

This script:
1. Installs Docker + the Compose plugin on the remote server (idempotent — safe to re-run)
2. `rsync`s the project source to `/opt/linear-clone` (excludes `node_modules`, `dist`, `.git`)
3. Runs `docker compose -f docker-compose.prod.yml up -d --build --remove-orphans`
4. Polls `http://<ip>/` until the app responds

Re-running the script after code changes will rebuild only the changed layers and do a rolling restart.

### Checking logs

```bash
ssh root@<ip> 'docker compose -f /opt/linear-clone/docker-compose.prod.yml logs -f'
```

### Environment variables (optional overrides)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_NAME` | `linearclone` | Postgres database name |
| `DB_USER` | `postgres` | Postgres user |
| `DB_PASSWORD` | `postgres` | Postgres password |

Set these in a `.env` file in the project root before running `deploy.sh` for a hardened production setup.

---

## Provisioning a new droplet

The droplet was provisioned via the DigitalOcean MCP during the MCP Dev Summit kata. To reprovision:

1. Register your SSH public key with your DigitalOcean account (one-time):
   ```bash
   curl -X POST https://api.digitalocean.com/v2/account/keys \
     -H "Authorization: Bearer $DIGITALOCEAN_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"my-key","public_key":"'"$(cat ~/.ssh/id_ed25519.pub)"'"}'
   ```

2. Create the droplet:
   - Size: `s-1vcpu-2gb` ($12/mo, 2 GB RAM — minimum comfortable for Docker builds)
   - Image: `ubuntu-22-04-x64`
   - Region: `nyc3`
   - SSH key: your registered fingerprint

3. Run `./deploy.sh <new-ip>`.
