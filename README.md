# LiNKtrend System

Proprietary **LiNKtrend** monorepo (Turborepo + pnpm): command centre (**LiNKaios**), worker wrapper (**bot-runtime**), **PRISM-Defender**, **Zulip-Gateway**, shared **LiNKlogic**-style packages, and Supabase-backed persistence.

Remote: [github.com/linktrend/LiNKtrend-System](https://github.com/linktrend/LiNKtrend-System)

## Prerequisites

- [Node.js](https://nodejs.org/) LTS (v20+ recommended)
- [pnpm](https://pnpm.io/) v10 (`corepack enable` then `corepack prepare pnpm@10.26.1 --activate`)

## Quick start

```bash
pnpm install
pnpm build
pnpm --filter @linktrend/linkaios-web dev
```

Other services (until wired fully):

```bash
pnpm --filter @linktrend/bot-runtime dev
pnpm --filter @linktrend/prism-defender dev
pnpm --filter @linktrend/zulip-gateway dev
```

## Environment variables

1. Copy `.env.example` to `.env` in the **repository root** (this file is git-ignored).
2. Fill in values from the Supabase dashboard (Project Settings → API, and Database → connection string).
3. **Never** commit `.env` or paste secret keys into GitHub issues, chat, or screenshots.

If any production or privileged credential was ever pasted into a chat or ticket, **rotate it in Supabase** (new secret key, rotate database password) before treating the project as secure.

## Database migrations (Supabase)

SQL files live in `services/migrations/`. They **drop and recreate** only the product schemas `linkaios`, `bot_runtime`, `prism`, and `gateway`. They do **not** remove Supabase `auth`, `storage`, or other system schemas.

**Recommended — Supabase SQL Editor:** open **SQL Editor** → paste `services/migrations/ALL_IN_ONE.sql` → **Run**. That applies drops, tables, demo seed, and API role grants in one step. See `services/migrations/README.md` for details.

**Optional — From your machine:** set `DATABASE_URL` in `.env`, then:

```bash
pnpm db:migrate
```

Use the **Session pooler** URI from the dashboard (**Connect** → **Session mode**) if `db.<project>.supabase.co` fails with `ENOTFOUND` (many networks are IPv4-only; the direct host is often IPv6-only).

### PostgREST: expose custom schemas

So the JavaScript client can use `.schema("linkaios")`, add these schemas to **exposed schemas** in Supabase (**Project Settings** → **Data API** / **API**): `linkaios`, `bot_runtime`, `prism`, `gateway`. Save, then reload LiNKaios.

The **Zulip server** continues to use its **own** database for Zulip’s native data; this project’s `gateway` schema only stores **bridge** metadata (for example message ↔ mission links).

## Layout

| Path | Role |
|------|------|
| `apps/linkaios-web` | Next.js (App Router) command centre |
| `apps/bot-runtime` | Worker runtime wrapper (OpenClaw integration later) |
| `apps/prism-defender` | Cleanup / containment sidecar |
| `apps/zulip-gateway` | Mission-aware Zulip bridge |
| `packages/linklogic-sdk` | Retrieval / enforcement (skeleton) |
| `packages/db` | Supabase client helpers |
| `packages/shared-types` | Cross-app types |
| `packages/shared-config` | Env parsing (Zod) |
| `packages/auth` | Auth helpers (placeholder) |
| `packages/observability` | Structured logging helper |
| `packages/ui` | Shared UI primitives |
| `services/migrations` | Postgres migrations + `run.mjs` |

Authoritative product docs remain the two markdown files at the repo root (architecture + PRD).

## Publishing to GitHub

```bash
git init   # skip if already initialized
git remote add origin https://github.com/linktrend/LiNKtrend-System.git
git add -A
git status   # confirm .env is not listed
git commit -m "chore: initial Turborepo skeleton and Supabase migrations"
git push -u origin main
```

Use `main` or your default branch name as appropriate.
