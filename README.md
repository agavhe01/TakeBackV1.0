# TakeBack V1.0

A credit/debit card management and spend management web application built with FastAPI, Next.js, React, TypeScript, PostgreSQL, Supabase, and Tailwind CSS.

## Live Application

| Service | URL |
|---------|-----|
| Frontend (Next.js) | [takeback-agavhera.vercel.app](https://takeback-agavhera.vercel.app/) |
| Backend (FastAPI) | [takeback-backend-agavhera.vercel.app](https://takeback-backend-agavhera.vercel.app/) |
| API Docs | [takeback-backend-agavhera.vercel.app/docs](https://takeback-backend-agavhera.vercel.app/docs) |

> **Demo login:** `test@gmail.com` / `password123`

---

TakeBack helps organizations manage their credit card spending through comprehensive budget tracking, virtual card issuance, and detailed transaction analytics. Users can create multiple budgets with different spending periods (weekly, monthly, quarterly), issue virtual cards linked to specific budgets, and track spending in real-time.

## Project Structure

```
takeback/
├── backend/                 # FastAPI backend (modular structure)
│   ├── app/
│   │   ├── main.py          # FastAPI app initialization
│   │   ├── config/          # Settings & Supabase client
│   │   ├── models/          # Pydantic data models
│   │   ├── services/        # Business logic layer
│   │   ├── api/             # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   └── utils/           # JWT utilities
│   ├── run.py               # Dev server entry point
│   ├── deploy.py            # Production entry point
│   ├── requirements.txt
│   └── vercel.json
├── frontend/                # Next.js frontend
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── package.json
│   └── vercel.json
├── database/                # Supabase local dev & migrations
│   └── supabase/
│       ├── config.toml      # Supabase project config
│       ├── migrations/      # SQL migration files
│       ├── seeds/           # Seed data (demo users & data)
│       └── snippets/
├── .github/workflows/       # CI/CD
│   ├── supabase-migration.yml   # PR validation (filename, destructive ops)
│   └── deploy-migrations.yml    # Auto-deploy migrations + redeploy Vercel
└── README.md
```

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+, Node.js 18+, [Docker Desktop](https://www.docker.com/products/docker-desktop/), [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

### Terminal 1 — Database

```bash
cd database
supabase start        # first run pulls Docker images
supabase db reset     # applies migrations + seed data
# Copy the output keys into backend/.env and frontend/.env.local
```

### Terminal 2 — Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp env.example .env   # fill in Supabase keys from above
python3 run.py        # http://localhost:8000
```

### Terminal 3 — Frontend

```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev           # http://localhost:3000
```

## Production Deployment

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel | Auto-deploys from `main` |
| Backend | Vercel (serverless) | Uses `deploy.py` entry point |
| Database | Supabase (hosted) | Migrations pushed via CI/CD |

## CI/CD

Two GitHub Actions workflows in `.github/workflows/` handle automation:

### 1. Validate Supabase Migrations (`supabase-migration.yml`)

**Trigger:** Pull requests that touch `database/supabase/**`

Runs three validation checks on any new migration files in the PR:

| Step | What it does |
|------|-------------|
| Check migration filename format | Ensures filenames match `YYYYMMDDHHMMSS_description.sql` |
| Warn on destructive operations | Adds a GitHub warning annotation if a migration contains `DROP` |
| Check timestamp ordering | Verifies all migration timestamps are in chronological order |

### 2. Deploy Migrations to Production (`deploy-migrations.yml`)

**Trigger:** Pushes to `main` that touch `database/supabase/migrations/**` or `database/supabase/config.toml`

Runs two jobs sequentially:

**Job 1: `deploy`** — Pushes migrations to Supabase
1. Checks out the repo
2. Installs the Supabase CLI
3. Links to the production project using `PRODUCTION_PROJECT_REF`
4. Runs `supabase db push --include-all` to apply any pending migrations

**Job 2: `redeploy-vercel`** (runs after `deploy` succeeds) — Redeploys both Vercel projects
1. Uses the Vercel REST API to fetch the latest production deployment for each project
2. Triggers a production redeployment from that deployment (no rebuild from source)
3. Runs in parallel for backend and frontend via a matrix strategy

```
Push to main (with migration changes)
  └─► deploy (Supabase db push)
        └─► redeploy-vercel (backend)  ─► Vercel API redeploy
        └─► redeploy-vercel (frontend) ─► Vercel API redeploy
```

## API Documentation

Interactive docs are available at `/docs` (Swagger UI) and `/redoc` when the backend is running.

### Key Endpoints

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login` |
| Budgets | `GET/POST /api/budgets`, `PUT/DELETE /api/budgets/{id}` |
| Cards | `GET/POST /api/cards`, `PUT/DELETE /api/cards/{id}` |
| Transactions | `GET/POST /api/transactions`, `PUT/DELETE /api/transactions/{id}` |
| Balances | `GET /api/balances`, `GET /api/cards/{id}/balance`, `GET /api/budgets/{id}/balance` |
| Receipts | Upload and manage receipt documents/images |
| Policies | `GET/POST /api/policies` — memo thresholds |
| Analytics | `GET /api/analytics` — spending analytics |

## Database Schema

| Table | Description |
|-------|-------------|
| `accounts` | User accounts with org details (name, EIN, contact info) |
| `budgets` | Spending budgets with limits and periods (weekly/monthly/quarterly) |
| `cards` | Virtual cards issued to cardholders |
| `card_budgets` | Many-to-many junction linking cards to budgets |
| `transactions` | Purchases against a specific card-budget combination |
| `receipts` | Uploaded receipt documents/images linked to transactions |
| `policies` | Per-account settings for memo thresholds |

Full schema lives in `database/supabase/migrations/`. See `database/README.md` for local setup.

## Features

- **Budget Management** — Create budgets with weekly/monthly/quarterly periods, spending limits, and receipt requirements
- **Card Management** — Issue virtual cards with multiple budget associations
- **Transaction Tracking** — Record transactions against card-budget combinations with optional receipts
- **Receipt Management** — Upload images/PDFs, link to transactions for audit compliance
- **Balance Calculations** — Real-time spending vs. limit tracking per card and budget
- **Policy Enforcement** — Configurable memo thresholds and budget limit triggers

## Required GitHub Configuration

### Secrets (Settings → Secrets → Actions)

| Name | Description |
|------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase dashboard access token |
| `SUPABASE_DB_PASSWORD` | Database password |
| `VERCEL_TOKEN` | Vercel API token |

### Variables (Settings → Variables → Actions)

| Name | Description |
|------|-------------|
| `PRODUCTION_PROJECT_REF` | Supabase project reference ID |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID_BACKEND` | Vercel project ID for backend |
| `VERCEL_PROJECT_ID_FRONTEND` | Vercel project ID for frontend |
