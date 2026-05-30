# SQL migrations

## One-shot apply (recommended)

From the Supabase dashboard: **SQL Editor** → **New query** → paste the contents of **`ALL_IN_ONE.sql`** (this folder) → **Run**.

That file runs, in order: drop service schemas → create `linkaios`, `bot_runtime`, `prism`, `gateway` → seed demo rows → grant API roles → **RLS policies** and `prism.swept_sessions` (same as `008_rls_and_prism_swept.sql`).

Existing projects that already applied an older `ALL_IN_ONE.sql` should run **`008_rls_and_prism_swept.sql`** once via `pnpm db:migrate` or the SQL Editor (additive; does **not** touch `auth` or existing users).

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

## Wave 4 — Mission→Project terminology (`033`, `034`)

Apply after UI/TS migration wave D planning is underway. Both migrations are **additive and idempotent** (safe to re-run).

| File | Purpose |
|------|---------|
| `033_linkaios_project_terminology.sql` | Renames `linkaios.missions` → `linkaios.projects`; renames `mission_id` → `project_id` on linkaios child tables; adds `linkaios.missions` **view** for backward compat; canonical functions `is_project_head` / `sync_project_manifest_tools` with legacy wrappers |
| `034_linkguard_schema_alias.sql` | Adds `linkguard` schema with views over legacy `prism` tables (superseded by `035`) |
| `035_linkguard_canonical_schema.sql` | Moves `prism` tables into `linkguard`; drops `prism` schema; canonical PostgREST surface |

**Not renamed in 033 (intentional):**

- `gateway.*.mission_id` columns — FK still targets `linkaios.projects`; column rename deferred to gateway wave
- `linkaios.mission_tools` table name and `org_missionless_default_tools` — legacy names; only `project_id` column inside `mission_tools`
- `tool_governance_requests.request_type` values (`mission_binding_add`, etc.) — audit/API compat until TS wave C completes
- `brain_virtual_files.scope = 'mission'` rows — CHECK also accepts `'project'` for new rows

**Post-apply:** expose **`linkguard`** only; remove **`prism`** from exposed schemas after `035`.

**`ALL_IN_ONE.sql`:** not updated automatically. After applying `033`–`035` to a live project, manually merge into `ALL_IN_ONE.sql` before the next greenfield bootstrap.
