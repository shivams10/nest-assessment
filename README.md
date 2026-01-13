# nest-assessment (pnpm / turbo monorepo)

This repo is a small monorepo managed with `pnpm` and `turbo`. It contains:

- `apps/backend`: NestJS API (Prisma + Postgres)
- `apps/frontend`: React + Vite frontend
- `apps/shared-types`: Shared types package (for future cross-app types)

## Requirements

- Node 20+
- `pnpm` installed globally (`npm i -g pnpm`)
- A Postgres instance

## Quick start

Install dependencies from the monorepo root:

```bash
pnpm install
```

Create a `.env` file in `apps/backend` (never commit this) with at least:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_ACCESS_SECRET="replace_me_access"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="replace_me_refresh"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"

# Optional: Google OAuth (if using Google login)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

Run database migrations and seed (from `apps/backend`):

```bash
cd apps/backend
pnpm prisma migrate deploy
pnpm prisma db seed
```

From the monorepo root you can then:

```bash
# run dev servers via turbo (backend + frontend)
pnpm dev

# or build everything
pnpm build
```

You can also run the apps individually:

```bash
# backend
cd apps/backend
pnpm start:dev

# frontend
cd apps/frontend
pnpm dev
```

## What is safe to publish

- No `.env` files or secrets are committed; runtime config is loaded from env vars.
- Database credentials, JWT secrets, and any other sensitive values must be provided via local `.env` files or your deployment environment – **never** commit them.

The top-level `.gitignore` already excludes `node_modules`, build artifacts, and `.env*` files for GitHub.


