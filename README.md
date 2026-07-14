# ElectricQuote AI

Monorepo for ElectricQuote AI V1: an AI-assisted quoting tool for electricians.

See `docs/01-PRD.md` and `docs/02-Technical-Architecture.md` for the full product and
architecture specification this codebase implements.

## Structure

```
electricquote-ai/
├── backend/    FastAPI + SQLAlchemy + PostgreSQL API
├── frontend/   React + TypeScript + Vite + Tailwind SPA
├── infra/      docker-compose (local dev) + render.yaml (deployment)
├── .github/    CI/CD workflows
└── docs/       PRD and architecture documents
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- Docker and Docker Compose (for local Postgres/Redis, or full containerized dev)

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env        # then fill in secrets

# Start Postgres + Redis (from infra/), or point DATABASE_URL/REDIS_URL at your own
docker compose -f ../infra/docker-compose.yml up -d postgres redis

alembic upgrade head
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs` (disabled in production).

Run tests:

```bash
pytest --cov=app
```

Lint / format / type-check:

```bash
ruff check .
black .
mypy app
```

## Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App available at `http://localhost:5173`.

Run tests:

```bash
npm run test        # unit tests (vitest)
npm run test:e2e     # end-to-end tests (playwright), requires the dev server
```

Lint / format / type-check:

```bash
npm run lint
npm run format
npm run typecheck
```

## Full local stack via Docker

```bash
docker compose -f infra/docker-compose.yml up --build
```

This starts Postgres, Redis, and the backend API. Run the frontend separately with
`npm run dev` inside `frontend/` (Vite's dev server is not containerized in V1 for fast
hot-reload; the production frontend build is deployed to Vercel instead).

## Deployment

- **Backend** deploys to Render via `infra/render.yaml` (Docker-based web service +
  scheduled quote-expiry worker + managed Postgres + managed Redis).
- **Frontend** deploys to Vercel (connect the `frontend/` directory as the project root).
- **CI** runs on every PR via `.github/workflows/backend-ci.yml` and `frontend-ci.yml`;
  `.github/workflows/deploy.yml` triggers production deploys on merge to `main`.

Required GitHub Actions secrets for deployment: `RENDER_SERVICE_ID`, `RENDER_DEPLOY_KEY`,
`VERCEL_TOKEN`.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list of required
configuration. Never commit a populated `.env` file.
