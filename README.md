# LiNKtrend System

Proprietary **LiNKtrend** monorepo (Turborepo + pnpm): command centre (**LiNKaios**), LiNKbot runtime adapters, **LiNKguard** worker cleanup/security sidecar, project-aware communications, shared **LiNKlogic**-style packages, tenant-enabled **suites**, LinkSkills **capabilities**, and Supabase-backed persistence.

Canonical terminology: **`docs/terminology.md`**

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

LiNKaios opens at `/login` until you sign in with a **Supabase Auth** user (Email provider). Command-centre reads use the **anon key + your session JWT** and **Row Level Security** (apply migration `008_rls_and_prism_swept.sql` or the tail of `ALL_IN_ONE.sql`; greenfield bootstrap via `ALL_IN_ONE.sql` includes `033`–`035` project terminology and `linkguard` schema state).

Other services and compatibility entrypoints:

```bash
pnpm --filter @linktrend/bot-runtime dev
pnpm --filter @linktrend/linkguard dev
pnpm --filter @linktrend/zulip-gateway dev
pnpm --filter @linktrend/openclaw-shim dev
```

- **bot-runtime** — compatibility entrypoint for `LiNKbot/runtime-adapters/openclaw`: opens a `bot_runtime.worker_sessions` row, heartbeats every 30s, builds `linktrendGovernance` (project + manifest tool names + skill instructions), writes `linkaios.traces` rows, optionally **POST**s to `OPENCLAW_AGENT_RUN_URL`, closes the session on SIGINT/SIGTERM.
- **zulip-gateway** — temporary project-aware communication bridge owned by `LiNKbot/communications`: HTTP server on port **8790** (override with `ZULIP_GATEWAY_PORT`). `POST /webhooks/zulip` upserts `gateway.zulip_message_links`. `GET /health` for probes.
- **linkguard** — LiNKguard sidecar (`@linktrend/linkguard`): heartbeat plus **residue sweep** — acknowledges closed `bot_runtime.worker_sessions` into `linkguard.swept_sessions` (disable with `PRISM_RESIDUE_SWEEP=0`, tune batch with `PRISM_RESIDUE_BATCH`). Env var names retain `PRISM_` prefix until Phase C completes.
- **openclaw-shim** — local HTTP mock (default port **8789**, `OPENCLAW_SHIM_PORT`). Set `OPENCLAW_AGENT_RUN_URL=http://127.0.0.1:8789/` on **bot-runtime** to exercise the governance POST without LiNKbot-core.

## Docker (optional)

LiNKaios plus the three LiNKtrend Plugin services as containers: **`deploy/README.md`** and **`docker-compose.linktrend.yml`** at the repo root. With Docker running and a filled **`.env`**, run `docker compose -f docker-compose.linktrend.yml build` then `up` from the repository root.

## Environment variables

1. Copy `.env.example` to `.env` in the **repository root** (this file is git-ignored).
2. Fill in values from the Supabase dashboard (Project Settings → API, and Database → connection string).
3. **Never** commit `.env` or paste secret keys into GitHub issues, chat, or screenshots.

If any production or privileged credential was ever pasted into a chat or ticket, **rotate it in Supabase** (new secret key, rotate database password) before treating the project as secure.

## Database migrations (Supabase)

SQL files live in `services/migrations/`. They **drop and recreate** only the product schemas `linkaios`, `bot_runtime`, `linkguard`, and `gateway` (legacy `prism` is dropped by `035_linkguard_canonical_schema.sql`). They do **not** remove Supabase `auth`, `storage`, or other system schemas.

**Recommended — Supabase SQL Editor:** open **SQL Editor** → paste `services/migrations/ALL_IN_ONE.sql` → **Run**. That applies drops, tables, demo seed, and API role grants in one step. See `services/migrations/README.md` for details.

**Optional — From your machine:** set `DATABASE_URL` in `.env`, then:

```bash
pnpm db:migrate
```

Use the **Session pooler** URI from the dashboard (**Connect** → **Session mode**) if `db.<project>.supabase.co` fails with `ENOTFOUND` (many networks are IPv4-only; the direct host is often IPv6-only).

### PostgREST: expose custom schemas

So the JavaScript client can use `.schema("linkaios")`, add these schemas to **exposed schemas** in Supabase (**Project Settings** → **Data API** / **API**): `linkaios`, `bot_runtime`, `linkguard`, `gateway`. Do **not** expose legacy `prism` after migration `035_linkguard_canonical_schema.sql` is applied.

The **Zulip server** continues to use its **own** database for Zulip’s native data; this project’s `gateway` schema only stores **bridge** metadata (for example message ↔ project links).

### OpenClaw fork handoff (LiNKbot-core)

The LiNKtrend engine fork typically lives beside this repo, for example `/Users/linktrend/Projects/LiNKbot-core`. Its contract is documented in that tree at `docs/linktrend-governance.md`: gateway **`agent`** RPC `params` include `message`, `idempotencyKey`, optional `sessionKey`, and `linktrendGovernance` (validated by `LinktrendGovernanceParamsSchema`).

**bot-runtime** posts to `OPENCLAW_AGENT_RUN_URL` (optional) using **`OPENCLAW_AGENT_RUN_BODY=agent_params`** by default: a flat JSON object with `message`, `idempotencyKey`, optional `sessionKey` / `agentId`, and `linktrendGovernance`. Point the URL at a small HTTP shim that forwards those fields to the gateway WebSocket `agent` call, or set **`OPENCLAW_AGENT_RUN_BODY=governance_only`** if your proxy already wraps governance alone.

LiNKbot-core’s built-in **`/hooks/.../agent`** path normalizes webhook payloads and does **not** forward `linktrendGovernance` today; do not assume posting to hooks is sufficient unless you extend the fork.

Optional env: `OPENCLAW_AGENT_INGRESS_MESSAGE`, `OPENCLAW_AGENT_SESSION_KEY`, `OPENCLAW_AGENT_ID`, `OPENCLAW_RUN_AUTH_BEARER`. Project and skill selection: `BOT_RUNTIME_MISSION_ID` (legacy env name; targets `linkaios.projects`), `BOT_RUNTIME_SKILL_NAME` (default `bootstrap`).

In **development**, LiNKaios exposes **Gov JSON** in the nav (`/devtools/governance`) — the same `linktrendGovernance` object used inside the default POST body — so you can verify Supabase reads without running the worker.

## Layout

| Path | Role |
|------|------|
| `docs/architecture/repo-architecture-target.md` | Canonical ownership map for this repo |
| `docs/architecture/system-completion-targets.md` | Target completed state for each system and module family |
| `LiNKaios/` | LiNKaios ownership home, including the command-centre app at `LiNKaios/linkaios-web` |
| `LiNKskills/` | LinkSkills governance, skills, tools, scripts, catalogs, and capability connectors |
| `LiNKskills/capability-connectors/` | Capability connector registry and connector docs/manifests |
| `LiNKbrain/` | LiNKbrain ownership home for memory, audit, retrieval, context, benchmarks, schemas, and migration references |
| `LiNKautowork/` | Deterministic workflow gateway and templates for the external n8n fork |
| `LiNKbot/` | Runtime adapters, roles, fleet metadata, and project-aware communications |
| `LiNKguard/` | Worker security and cleanup sidecar formerly known as PRISM Defender |
| `suites/` | Tenant-enabled business/operational **suites** (LinkSites, LiNKapps, LEXOS, …) |
| `docs/terminology.md` | Canonical LiNKaios UI ↔ repo terminology map |
| `LiNKaios/linkaios-web` | Next.js (App Router) command centre compatibility entrypoint |
| `LiNKbot/runtime-adapters/openclaw/bot-runtime` | LiNKbot OpenClaw runtime adapter package |
| `LiNKbot/runtime-adapters/openclaw/openclaw-shim` | Local ingress mock for `bot-runtime` POSTs |
| `LiNKbot/communications/temporary-gateways/zulip` | Temporary Zulip project-aware bridge |
| `LiNKguard/sidecar/linkguard` | LiNKguard sidecar package |
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
