# TakeBack Database

Supabase local development setup for the TakeBack project.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

## Quick Start

```bash
cd database

# Start local Supabase (first run pulls Docker images)
supabase start

# Apply migrations and seed data
supabase db reset

# Open Supabase Studio
open http://localhost:54323
```

After `supabase start`, copy the output keys into your env files:

**`backend/.env`**
```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=<service_role key from supabase start>
JWT_SECRET=<jwt_secret from supabase start>
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
```

## Tables

accounts, budgets, cards, card_budgets, transactions, receipts, policies

## Storage

- `receipt-storage` bucket (public, 10 MiB limit)

## Seed Data

The seed file (`supabase/seeds/01_seed.sql`) populates the local database with demo accounts, budgets, cards, transactions, and receipts. Run `supabase db reset` to apply.

## Remote Deployment

To push migrations and seed data to the hosted Supabase project:

```bash
cd database

# Link to your production project (one-time)
supabase link --project-ref <your-project-ref>

# Push pending migrations
supabase db push

# Seed production via psql (if needed)
psql "$SUPABASE_DB_URL" -f supabase/seeds/01_seed.sql
```

> **Note:** Migrations are automatically deployed to production via the `deploy-migrations.yml` GitHub Actions workflow when changes are pushed to `main`. See the root `README.md` for CI/CD details and required GitHub secrets.

## Shutdown

```bash
supabase stop
```
