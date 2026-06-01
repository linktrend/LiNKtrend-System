# Program STATUS: linktrend-system

**Phase:** `running` — **MVO implementation complete on `development`** (verify 2026-06-01)  
**Planner:** G1/G2 council PASS at program start  
**Wave 6 council:** G3 PASS — `LiNKdev/product/reports/linktrend-system/council/G3-report.json`  
**Issues:** 31 total — **31 done** on `development` after wave 9–15 re-verification (PR #95 reset honored, PR #102/#103 + completion PR)

## MVO demo (LTS-108)

Reproducible command (no live Payload/VPS required for proof):

```bash
cd /path/to/LiNKtrend-System
./scripts/run-mvo-linksites-demo.sh
```

Optional kernel E2E (requires local `.env` with `BOT_KERNEL_API_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`):

```bash
pnpm exec tsx scripts/run-e2e.ts
```

**UI surfaces** (start `linkaios-web` dev server):

| Surface | URL |
|---------|-----|
| Client MVO proof | http://localhost:3000/devtools/mvo-proof |
| Admin MVO proof | http://localhost:3000/admin/devtools/mvo-proof |

**Temp publish URL pattern (MVO):** `https://{business-slug}.linktrend.media` — produced after `payload_sync_local` + `preview_readiness_check` pass; live Payload uses `LINKAUTOWORK_PAYLOAD_*` env, mock uses `LINKAUTOWORK_MVO_MODE=mock`.

## Principal Q&A (binding)

| ID | Answer | Summary |
|----|--------|---------|
| D1 | B | Governed mock lead |
| D2 | A | Governed draft-only outreach |
| D3 | B | Full Librarian loop + world brain |
| D4 | B | Full Admin vendor catalogue |

## Verify (2026-06-01)

```bash
pnpm build
./scripts/run-mvo-linksites-demo.sh
LINKDEV_TIER=critical LINKDEV_PROGRAM=linktrend-system LiNKdev/factory/scripts/verify.sh
LiNKdev/factory/scripts/program-proof-manifest.sh linktrend-system
```

## Release

**Blocked on Principal only:** Release OK before `development` → `staging` → `main`. SHIP_CRITERIA §5 Principal Release OK remains unchecked until human approval.
