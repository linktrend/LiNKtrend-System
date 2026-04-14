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
pnpm test
pnpm --filter @linktrend/linkaios-web dev
```

LiNKaios opens at `/login` until you sign in with a **Supabase Auth** user (Email provider). Command-centre reads use the **anon key + your session JWT** and **Row Level Security** (apply migration `008_rls_and_prism_swept.sql` or the tail of `ALL_IN_ONE.sql`).

Other services:

```bash
pnpm --filter @linktrend/bot-runtime dev
pnpm --filter @linktrend/prism-defender dev
pnpm --filter @linktrend/zulip-gateway dev
pnpm --filter @linktrend/openclaw-shim dev
```

- **bot-runtime** — opens a `bot_runtime.worker_sessions` row, heartbeats every 30s, builds `linktrendGovernance` (mission + manifest tool names + skill instructions), writes `linkaios.traces` rows, optionally **POST**s to `OPENCLAW_AGENT_RUN_URL`, closes the session on SIGINT/SIGTERM.
- **zulip-gateway** — HTTP server on port **8790** (override with `ZULIP_GATEWAY_PORT`). `POST /webhooks/zulip` upserts `gateway.zulip_message_links`. `GET /health` for probes.
- **prism-defender** — heartbeat plus **residue sweep**: acknowledges closed `bot_runtime.worker_sessions` into `prism.swept_sessions` (disable with `PRISM_RESIDUE_SWEEP=0`, tune batch with `PRISM_RESIDUE_BATCH`).
- **openclaw-shim** — local HTTP mock (default port **8789**, `OPENCLAW_SHIM_PORT`). Set `OPENCLAW_AGENT_RUN_URL=http://127.0.0.1:8789/` on **bot-runtime** to exercise the governance POST without LiNKbot-core.

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

### OpenClaw fork handoff (LiNKbot-core)

The LiNKtrend engine fork typically lives beside this repo, for example `/Users/linktrend/Projects/LiNKbot-core`. Its contract is documented in that tree at `docs/linktrend-governance.md`: gateway **`agent`** RPC `params` include `message`, `idempotencyKey`, optional `sessionKey`, and `linktrendGovernance` (validated by `LinktrendGovernanceParamsSchema`).

**bot-runtime** posts to `OPENCLAW_AGENT_RUN_URL` (optional) using **`OPENCLAW_AGENT_RUN_BODY=agent_params`** by default: a flat JSON object with `message`, `idempotencyKey`, optional `sessionKey` / `agentId`, and `linktrendGovernance`. Point the URL at a small HTTP shim that forwards those fields to the gateway WebSocket `agent` call, or set **`OPENCLAW_AGENT_RUN_BODY=governance_only`** if your proxy already wraps governance alone.

LiNKbot-core’s built-in **`/hooks/.../agent`** path normalizes webhook payloads and does **not** forward `linktrendGovernance` today; do not assume posting to hooks is sufficient unless you extend the fork.

Optional env: `OPENCLAW_AGENT_INGRESS_MESSAGE`, `OPENCLAW_AGENT_SESSION_KEY`, `OPENCLAW_AGENT_ID`, `OPENCLAW_RUN_AUTH_BEARER`. Mission and skill selection: `BOT_RUNTIME_MISSION_ID`, `BOT_RUNTIME_SKILL_NAME` (default `bootstrap`).

In **development**, LiNKaios exposes **Gov JSON** in the nav (`/devtools/governance`) — the same `linktrendGovernance` object used inside the default POST body — so you can verify Supabase reads without running the worker.

## Layout

| Path | Role |
|------|------|
| `apps/linkaios-web` | Next.js (App Router) command centre |
| `apps/bot-runtime` | Worker runtime wrapper; optional OpenClaw governance POST |
| `apps/prism-defender` | Cleanup / containment sidecar |
| `apps/zulip-gateway` | Mission-aware Zulip bridge |
| `apps/openclaw-shim` | Local ingress mock for `bot-runtime` POSTs |
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
