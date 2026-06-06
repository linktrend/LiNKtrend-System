# Wave 11 — DigitalOcean acceptance

**Plan:** `STUDIO_FORWARD_PLAN.md` Wave 11 (11.1–11.7)  
**Branch:** `issue/wave11-do-acceptance`  
**Date:** 2026-06-06  
**Host:** DigitalOcean `linkdroplet-00` / `linkdroplet-01`

Wave 11 is the **gate before Hetzner** (Wave 12 **DEFERRED**). Implementation does **not** block on Principal Release OK (11.7) — that item is a documented human gate only.

---

## Deliverables

| # | Deliverable | Status | Evidence |
|---|-------------|--------|----------|
| 11.1 | Fleet proof doc (5 OC, 8 AZ, automations, council) | **PASS** | `WAVE11_FLEET_PROOF.md` |
| 11.2 | Admin: LiNKsuitegen cycle → publish candidate | **PASS** (local) | `verify-wave10-linksuitegen.sh`, `admin-integration.test.ts` |
| 11.3 | Client: LinkSites MVO re-run **13/13** | **PASS** | `run-mvo-linksites-acceptance.sh`, `verify-mvo-13-stages.mjs`, `MVO_AREA1_PROOF_2026-06-02.md` |
| 11.4 | LiNKdeveloper G2 pilot prep | **PASS** (prep) | `run-linkdeveloper-g2-pilot-prep.sh`, `LINKDEVELOPER_G2_PILOT_PREP.md` |
| 11.5 | RAM snapshot under load | **DOC** | `docs/ops/linkdroplet-00-ram-snapshot.md`, `capture-ram-snapshot.sh` |
| 11.6 | Tenant isolation on DO | **PASS** | `tenant-isolation.test.ts` (CI); two test tenants |
| 11.7 | Principal **Release OK** (staging → prod on DO) | **GATE** | Human only — see § Principal Release OK |

---

## Verification

```bash
# Full Wave 11 local acceptance suite
./scripts/verify-wave11-do-acceptance.sh

# LinkSites MVO re-run (live when Supabase + secrets in .env)
./scripts/run-mvo-linksites-acceptance.sh

# LiNKdeveloper G2 pilot prep (local gates)
./scripts/run-linkdeveloper-g2-pilot-prep.sh

# RAM snapshot (on VPS)
RAM_SNAPSHOT_REMOTE=1 ./scripts/capture-ram-snapshot.sh
```

### 11.3 — 13/13 stages

Canonical kernel stages verified by `scripts/verify-mvo-13-stages.mjs`:

`lead_intake` → `research_enrichment` → `website_package_generation` → `artifact_write_local` → `supabase_mirror_upsert` → `payload_sync_local` → `preview_readiness_check` → `crm_ready_to_contact_mark` → `outreach_draft` → `plane_execution_tracking` → `zulip_run_notify` → `close_or_recycle` → `record_run`

Persisted manifest: `mvo-latest-run.json` (gitignored; example shape in `mvo-latest-run.example.json`).  
Prior live proof: run `9e492225-3dd3-426a-82db-7739fadd4d6a` — `MVO_AREA1_PROOF_2026-06-02.md`.

---

## Principal Release OK (11.7) — document gate only

**Not blocking** Wave 11 implementation or this PR.

| Gate | Owner | Action |
|------|-------|--------|
| Staging → production promotion on DO | **Principal** | Explicit **Release OK** after reviewing Wave 11 evidence |
| Required artifacts for review | Integrator | This report, `WAVE11_FLEET_PROOF.md`, MVO 13/13 manifest, RAM snapshot doc |
| Hetzner migration (Wave 12) | **Deferred** | Starts only after 11.7 + Hetzner account — `docs/deploy/WAVE12_HETZNER_MIGRATION_DEFERRED.md` |

Until Principal Release OK:

- DO droplets remain launch/test posture.
- Wave 12 provisioning runbooks are documented but **not executed**.

---

## Wave 12 — Hetzner

**Status: DEFERRED**

See `docs/deploy/WAVE12_HETZNER_MIGRATION_DEFERRED.md`. No Hetzner provisioning in this wave.

---

## Verdict

**Wave 11 DigitalOcean acceptance: PASS** (automated + documented gates; 11.7 human gate outstanding by design).
