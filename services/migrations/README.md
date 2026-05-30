# SQL migrations

## One-shot apply (recommended)

From the Supabase dashboard: **SQL Editor** → **New query** → paste the contents of **`ALL_IN_ONE.sql`** (this folder) → **Run**.

That file runs, in order: drop service schemas → create `linkaios`, `bot_runtime`, `linkguard`, `gateway` → seed demo rows → grant API roles → **RLS policies** and `linkguard.swept_sessions` (includes project terminology from `033`–`035`; legacy `prism` schema is not created).

Existing projects that already applied an older `ALL_IN_ONE.sql` should run incremental migrations via `pnpm db:migrate` or the SQL Editor (additive; does **not** touch `auth` or existing users).

**Removed duplicate:** `025_linkskills_linksites_capability_catalog.sql` was dropped from the chain — it duplicated `029_linkskills_linksites_capability_catalog.sql`. Use **`029`** only.

## Expose schemas (required for the JS client)

Dashboard: **Project Settings** → **Data API** (or **API**) → **Exposed schemas**. Add:

`linkaios`, `bot_runtime`, `linkguard`, `gateway`

Do **not** expose `prism` after `035_linkguard_canonical_schema.sql` (tables live in `linkguard`; `prism` schema is dropped).

Save. Without this step, PostgREST returns `PGRST106` / “Invalid schema”.

## CLI apply (optional, needs IPv4 pooler URL)

`pnpm db:migrate` runs numbered `*.sql` using `DATABASE_URL` from `.env` (it **skips** `ALL_IN_ONE.sql` so you are not applying the same DDL twice).

- Direct host `db.<project>.supabase.co:5432` is often **IPv6-only**. If `pnpm db:migrate` fails with `ENOTFOUND`, copy the **Session pooler** connection string from the dashboard (**Connect** → **Session mode**) into `DATABASE_URL` instead.

## Zulip

The Zulip **server** keeps its own Postgres. The `gateway` schema here only stores bridge metadata.

## Wave 4 — Mission→Project terminology (`033`, `034`, `035`)

| File | Purpose |
|------|---------|
| `033_linkaios_project_terminology.sql` | Renames `linkaios.missions` → `linkaios.projects`; renames `mission_id` → `project_id` on linkaios child tables; adds `linkaios.missions` **view** for backward compat; canonical functions `is_project_head` / `sync_project_manifest_tools` with legacy wrappers |
| `034_linkguard_schema_alias.sql` | Adds `linkguard` schema with views over legacy `prism` tables (superseded by `035`) |
| `035_linkguard_canonical_schema.sql` | Moves `prism` tables into `linkguard`; drops `prism` schema; canonical PostgREST surface |

**Status:** **`033`–`035` are applied** on current environments and are **merged into `ALL_IN_ONE.sql`** for greenfield bootstrap (projects table, `linkguard` schema, no standalone `prism` schema).

**Not renamed in 033 (intentional):**

- `gateway.*.mission_id` columns — FK still targets `linkaios.projects`; column rename deferred to gateway wave
- `linkaios.mission_tools` table name and `org_missionless_default_tools` — legacy names; only `project_id` column inside `mission_tools`
- `tool_governance_requests.request_type` values (`mission_binding_add`, etc.) — audit/API compat until TS wave C completes
- `brain_virtual_files.scope = 'mission'` rows — CHECK also accepts `'project'` for new rows

**Post-apply:** expose **`linkguard`** only; do **not** expose **`prism`** (schema dropped by `035`).
