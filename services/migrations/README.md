# SQL migrations

## One-shot apply (recommended)

From the Supabase dashboard: **SQL Editor** → **New query** → paste the contents of **`ALL_IN_ONE.sql`** (this folder) → **Run**.

That file runs, in order: drop service schemas → create `linkaios`, `bot_runtime`, `prism`, `gateway` → seed demo rows → grant API roles.

## Expose schemas (required for the JS client)

Dashboard: **Project Settings** → **Data API** (or **API**) → **Exposed schemas**. Add:

`linkaios`, `bot_runtime`, `prism`, `gateway`

Save. Without this step, PostgREST returns `PGRST106` / “Invalid schema”.

## CLI apply (optional, needs IPv4 pooler URL)

`pnpm db:migrate` runs numbered `*.sql` using `DATABASE_URL` from `.env`.

- Direct host `db.<project>.supabase.co:5432` is often **IPv6-only**. If `pnpm db:migrate` fails with `ENOTFOUND`, copy the **Session pooler** connection string from the dashboard (**Connect** → **Session mode**) into `DATABASE_URL` instead.

## Zulip

The Zulip **server** keeps its own Postgres. The `gateway` schema here only stores bridge metadata.
