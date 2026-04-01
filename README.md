# Linear Clone

A full-stack Linear.app clone with a React frontend, TypeScript/Express backend, and PostgreSQL database — containerized with Docker Compose for easy local development.

![Linear Clone Screenshot](docs/screenshot.png)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                    localhost:3000                           │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼─────────────────────────────────┐
│                  Frontend (nginx)                           │
│              React + TypeScript + Vite                      │
│    • Issue list grouped by status                           │
│    • Issue detail with inline editing                       │
│    • Create/update/delete modals                            │
│    • Comments                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │ /api/* proxy
┌───────────────────────────▼─────────────────────────────────┐
│               Backend (Node.js / Express)                   │
│                     TypeScript                              │
│    • REST API: /api/issues, /api/labels, /api/teams         │
│    • Full CRUD for issues                                   │
│    • Comments endpoint                                      │
│    • CORS, JSON middleware                                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ pg pool
┌───────────────────────────▼─────────────────────────────────┐
│                     PostgreSQL 16                           │
│    Tables: teams, issues, labels, issue_labels, comments    │
│    Enum types: issue_status, issue_priority                 │
│    Seed data: 8 sample Engineering issues                   │
└─────────────────────────────────────────────────────────────┘
```

### Service overview

| Service    | Technology           | Responsibility                          |
|------------|----------------------|-----------------------------------------|
| `frontend` | React 18 + Vite + nginx | SPA served via nginx, proxies `/api` to backend |
| `backend`  | Node.js + Express + TypeScript | REST API, business logic           |
| `postgres` | PostgreSQL 16        | Persistent data store                   |
| `migrate`  | One-shot Node container | Runs DB schema migrations + seed data |

### Data model

```
teams           — workspace/team (e.g. "Engineering", identifier "ENG")
issues          — core entity: identifier, title, description, status, priority
labels          — colour-coded tags scoped to a team
issue_labels    — many-to-many junction between issues and labels
comments        — threaded comments on an issue
```

Issue status: `backlog | todo | in_progress | in_review | done | cancelled`  
Issue priority: `no_priority | urgent | high | medium | low`

---

## Quickstart

### Prerequisites

- Docker ≥ 24 and Docker Compose v2
- Ports 3000 and 3001 free (or configure via `.env`)

### Run with defaults

```bash
git clone https://github.com/tadasant/demo-mcp-dev-summit-linear.git
cd demo-mcp-dev-summit-linear

docker compose up --build
```

Open **http://localhost:3000** in your browser.

On first run, Docker Compose will:
1. Start PostgreSQL and wait for it to be healthy
2. Run `migrate` (one-shot): creates tables, enums, and seeds 8 sample issues
3. Start the backend API on port 3001
4. Build and serve the React frontend on port 3000

---

## Configuration

Copy the example env file and edit as needed:

```bash
cp .env.example .env
```

| Variable        | Default        | Description                          |
|-----------------|----------------|--------------------------------------|
| `POSTGRES_DB`   | `linearclone`  | Database name                        |
| `POSTGRES_USER` | `postgres`     | Database user                        |
| `POSTGRES_PASSWORD` | `postgres` | Database password                    |
| `POSTGRES_PORT` | `5432`         | Host-side port for Postgres          |
| `FRONTEND_PORT` | `3000`         | Host-side port for the frontend      |
| `BACKEND_PORT`  | `3001`         | Host-side port for the backend API   |

---

## Running Multiple Instances Simultaneously

You can run multiple fully isolated dev environments on the same machine by using different port assignments and Docker Compose project names.

### Instance A (default)

```bash
# Uses defaults: frontend=3000, backend=3001, postgres=5432
docker compose --project-name linear-a up --build -d
```

### Instance B (offset ports by 10)

```bash
FRONTEND_PORT=3010 BACKEND_PORT=3011 POSTGRES_PORT=5442 \
  docker compose --project-name linear-b up --build -d
```

### Instance C (offset ports by 20)

```bash
FRONTEND_PORT=3020 BACKEND_PORT=3021 POSTGRES_PORT=5452 \
  docker compose --project-name linear-c up --build -d
```

Each `--project-name` flag creates an isolated set of containers, networks, and named volumes — so their databases do not share state.

To stop and clean up a specific instance:

```bash
docker compose --project-name linear-b down -v   # -v removes the postgres volume too
```

To list running instances:

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

---

## API Reference

Base URL: `http://localhost:3001`

### Health check

```
GET /health
→ { "status": "ok", "timestamp": "..." }
```

### Issues

| Method | Path                        | Description                   |
|--------|-----------------------------|-------------------------------|
| GET    | `/api/issues`               | List all issues (supports `?search=`, `?status=`, `?priority=`) |
| GET    | `/api/issues/:id`           | Get single issue with comments |
| POST   | `/api/issues`               | Create issue                  |
| PUT    | `/api/issues/:id`           | Update issue (partial)        |
| DELETE | `/api/issues/:id`           | Delete issue                  |
| POST   | `/api/issues/:id/comments`  | Add comment to issue          |

### Labels

| Method | Path          | Description      |
|--------|---------------|------------------|
| GET    | `/api/labels` | List all labels  |

### Teams

| Method | Path         | Description     |
|--------|--------------|-----------------|
| GET    | `/api/teams` | List all teams  |

### Create issue body

```json
{
  "title": "My issue title",
  "description": "Optional description",
  "status": "backlog",
  "priority": "high",
  "label_ids": [1, 2]
}
```

### Update issue body (all fields optional)

```json
{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "urgent",
  "label_ids": [3]
}
```

---

## Local development (without Docker)

If you prefer to run services directly on your machine:

### PostgreSQL

```bash
# Start a local Postgres instance, then:
createdb linearclone
```

### Backend

```bash
cd backend
cp .env.example .env          # edit DB connection if needed
npm install
npm run migrate               # run migrations and seed
npm run dev                   # starts on :3001 with hot reload
```

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:3001 npm run dev   # starts on :3000
```

---

## Flows tested with Chrome DevTools

The following flows were verified end-to-end using the Chrome DevTools MCP integration against the running Docker Compose stack:

### 1. Create issue
- Opened "New issue" modal
- Filled title "Test CRUD: New issue from Chrome DevTools"
- Added description
- Set priority to **High** via dropdown
- Submitted → ENG-9 appeared instantly in the Backlog group; issue count incremented from 8 → 9

### 2. Read issue
- Clicked ENG-9 row → navigated to `/issues/41`
- Verified: title, description, status (Backlog), priority (High), created/updated timestamps all displayed correctly
- Confirmed data integrity via direct API: `GET /api/issues/41`

### 3. Update issue — status change
- Clicked **Backlog** status button in the right sidebar
- Selected **In Progress** from dropdown
- Status updated immediately with orange in-progress icon; `updated_at` timestamp refreshed

### 4. Update issue — inline title edit
- Clicked the issue title to enter edit mode
- Changed to "Test CRUD: Updated title via inline edit"
- Pressed Enter to save
- Title updated immediately; `updated_at` refreshed
- Verified via API: updated title persisted in PostgreSQL

### 5. Add comment
- Typed comment text in the comment textarea
- Clicked "Save (⌘↵)"
- Comment appeared with author "You" and relative timestamp
- Comments count incremented from 0 → 1
- Verified via `GET /api/issues/41`: comment body and count persisted in DB

### 6. Search
- Typed "auth" in the search box
- List filtered to 1 issue: ENG-1 "Set up authentication flow"
- Count updated to "1 issue"

### 7. Delete issue
- Clicked trash icon on ENG-9 detail page
- Confirmation dialog appeared with "Delete ENG-9" warning
- Confirmed → redirected to `/issues`
- ENG-9 no longer in list; count back to 8
- Verified: `GET /api/issues/41` returns 404

---

## Project structure

```
.
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Port and DB configuration
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Express app entrypoint
│       ├── types.ts            # Shared TypeScript types
│       ├── db/
│       │   ├── pool.ts         # pg Pool singleton
│       │   └── migrate.ts      # Schema migrations + seed
│       └── routes/
│           ├── issues.ts       # Full CRUD + comments
│           ├── labels.ts       # Label listing
│           └── teams.ts        # Team listing
└── frontend/
    ├── Dockerfile              # Multi-stage: Vite build → nginx
    ├── nginx.conf              # SPA routing + /api proxy
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx            # React + QueryClient entrypoint
        ├── App.tsx             # Router + Sidebar + main layout
        ├── api.ts              # Axios API client
        ├── types.ts            # Shared TypeScript types
        ├── index.css           # Global CSS variables (design tokens)
        ├── components/
        │   ├── Sidebar.tsx     # Left nav with workspace + team links
        │   ├── IssueGroup.tsx  # Collapsible status group
        │   ├── IssueRow.tsx    # Single issue row (priority+status+title+labels)
        │   ├── CreateIssueModal.tsx  # Create issue form modal
        │   ├── StatusIcon.tsx  # Status SVG icons + config
        │   ├── PriorityIcon.tsx # Priority SVG icons + config
        │   └── icons.tsx       # All SVG icon components
        └── pages/
            ├── IssuesPage.tsx  # Main issue list with search + grouping
            ├── IssueDetailPage.tsx  # Issue detail with inline edit + comments
            └── PlaceholderPage.tsx  # Stub pages (Inbox, Projects, Views)
```
