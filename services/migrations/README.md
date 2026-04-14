# SQL migrations

## One-shot apply (recommended)

From the Supabase dashboard: **SQL Editor** → **New query** → paste the contents of **`ALL_IN_ONE.sql`** (this folder) → **Run**.

That file runs, in order: drop service schemas → create `linkaios`, `bot_runtime`, `prism`, `gateway` → seed demo rows → grant API roles → **RLS policies** and `prism.swept_sessions` (same as `008_rls_and_prism_swept.sql`).

Existing projects that already applied an older `ALL_IN_ONE.sql` should run **`008_rls_and_prism_swept.sql`** once via `pnpm db:migrate` or the SQL Editor (additive; does **not** touch `auth` or existing users).

## Expose schemas (required for the JS client)

Dashboard: **Project Settings** → **Data API** (or **API**) → **Exposed schemas**. Add:

`linkaios`, `bot_runtime`, `prism`, `gateway`

Save. Without this step, PostgREST returns `PGRST106` / “Invalid schema”.

## CLI apply (optional, needs IPv4 pooler URL)

`pnpm db:migrate` runs numbered `*.sql` using `DATABASE_URL` from `.env` (it **skips** `ALL_IN_ONE.sql` so you are not applying the same DDL twice).

- Direct host `db.<project>.supabase.co:5432` is often **IPv6-only**. If `pnpm db:migrate` fails with `ENOTFOUND`, copy the **Session pooler** connection string from the dashboard (**Connect** → **Session mode**) into `DATABASE_URL` instead.

## Zulip

The Zulip **server** keeps its own Postgres. The `gateway` schema here only stores bridge metadata.
