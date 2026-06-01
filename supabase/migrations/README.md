# Supabase migrations (LiNKaios MVO spine)

Canonical **Supabase CLI** migration path for LTS-001 kernel/brain/skills exposure and the Project→Run trace spine.

## Apply

**Greenfield:** run `services/migrations/ALL_IN_ONE.sql` first (see `services/migrations/README.md`), then apply files here in timestamp order.

**Incremental:** from repo root with `DATABASE_URL` set (Session pooler URI recommended):

```bash
pnpm db:migrate
```

Or paste each file into the Supabase SQL Editor.

## Post-apply (Dashboard)

**Project Settings → Data API → Exposed schemas** must include:

`linkaios`, `linkaios_kernel`, `linkbrain`, `linkskills`, `bot_runtime`, `linkguard`, `gateway`

## GSM secrets

Runtime secrets use Google Secret Manager naming (`LINKTREND_*`). See root `.env.example` placeholders only — never commit values.
