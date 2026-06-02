# LinkSites MVO run manifest

After a successful kernel E2E (`./scripts/run-mvo-linksites-demo.sh` with Supabase env), the harness writes:

`LiNKdev/product/reports/linktrend-system/mvo-latest-run.json` (gitignored)

Copy `mvo-latest-run.example.json` for shape reference.

## Prerequisites (local dev)

Apply database migrations so `linkaios.traces.project_id` exists (Mission → Project wave):

```bash
pnpm db:migrate
# or: supabase db push (when using Supabase CLI against your project)
```

Required migrations include:

- `services/migrations/033_linkaios_project_terminology.sql` — renames `mission_id` → `project_id` on `linkaios.traces`
- `supabase/migrations/202606010002_project_run_spine.sql` — project ↔ run spine RPCs

Without `033`, UI queries selecting `project_id` against an unmigrated DB will fail; legacy DBs still expose `mission_id` only.

## UI surfaces

| Surface | Reads |
|---------|--------|
| `/devtools/mvo-proof` | `mvo-latest-run.json` when present, else static sample (labeled) |
| `/projects/[id]?tab=phases` | `get_project_run_spine` + `get_run_stages` from Supabase |
| `/work/alerts` | `linkaios.traces` via `project_id` column |
