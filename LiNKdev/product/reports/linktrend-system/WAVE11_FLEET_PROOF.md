# Wave 11.1 — Fleet proof sign-off (DigitalOcean launch)

**Date:** 2026-06-06  
**Host:** `linkdroplet-00` (compute), `linkdroplet-01` (collaboration)  
**Plan:** `STUDIO_FORWARD_PLAN.md` Wave 11.1  
**Policy:** `docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md`

Single markdown sign-off for fleet v1 on DigitalOcean before Hetzner migration (Wave 12 **deferred**).

---

## 1. OpenClaw profiles (5/5)

One `openclaw-gateway` process; canonical IDs in `LiNKbot/roles/platform/fleet-v1-openclaw.ts`.

| agentId | Tenant | Role |
|---------|--------|------|
| `admin-openclaw` | Admin (vendor) | Vendor CEO + LiNKsuitegen head |
| `ceo-client` | Client (Linktrend) | Base Client subscription CEO |
| `linksites-head` | Client | LinkSites suite head |
| `linkdeveloper-orchestrator` | Client | LiNKdeveloper factory orchestrator |
| `linkdeveloper-steward` | Client | LiNKdeveloper product steward |

**Config:** LiNKbot-core `deploy/prod/openclaw.json`  
**Workspaces:** LiNKbot-core `deploy/prod/workspaces/<agentId>/`  
**Bootstrap:** `ops/bootstrap-linkbot-state.sh`

---

## 2. Agent Zero lanes (8/8)

Canonical IDs in `LiNKbot/roles/platform/agent-zero-lanes.ts`; worker on linkdroplet-00.

| Lane ID | Queue | Serves |
|---------|-------|--------|
| `az-librarian` | `linktrend.az.librarian` | LiNKbrain librarian ingest/propose |
| `az-suitegen-factory` | `linktrend.az.suitegen-factory` | LiNKsuitegen factory analysts |
| `az-linksites-research` | `linktrend.az.linksites-research` | LinkSites lead scout / enrichment |
| `az-linksites-build` | `linktrend.az.linksites-build` | LinkSites website builder |
| `az-linkdeveloper-analysis` | `linktrend.az.linkdeveloper-analysis` | Market, requirements |
| `az-linkdeveloper-architecture` | `linktrend.az.linkdeveloper-architecture` | Architecture, platform |
| `az-linkdeveloper-validation` | `linktrend.az.linkdeveloper-validation` | QA, security |
| `az-linkdeveloper-ops` | `linktrend.az.linkdeveloper-ops` | DevOps |

**Adapter:** `LiNKbot/runtime-adapters/agent-zero/`  
**Compose:** `deploy/docker/agent-zero.Dockerfile`

---

## 3. LiNKautowork automations (MVO suites)

Source of truth: `LiNKautowork/automations/templates/manifest.json`

### LinkSites (ops_approved on DO)

| workflow_id | Stage / purpose |
|-------------|-----------------|
| `linksites-artifact_write_local` | Artifact write |
| `linksites-supabase_mirror_upsert` | Brain mirror |
| `linksites-payload_sync_local` | Payload CMS sync |
| `linksites-preview_readiness_check` | Preview gate |
| `linksites-crm_ready_to_contact_mark` | CRM ready |
| `linksites-outreach_dispatch` | Governed outreach |

### LiNKsuitegen (factory)

| workflow_id | Purpose |
|-------------|---------|
| `linksuitegen-orchestrator_cycle` | Orchestrator cycle |
| `linksuitegen-discovery_collect` | Discovery |
| `linksuitegen-ranking_persist` | Ranking |
| `linksuitegen-factory_generate` | Generate |
| `linksuitegen-factory_validate` | Validate |
| `linksuitegen-factory_export` | Export |
| `linksuitegen-admin_handoff` | Admin handoff |
| `linksuitegen-crm_step` | CRM step |
| `linksuitegen-odoo_lead_create` | Odoo shadow lead |

### LiNKdeveloper (factory)

| workflow_id | Purpose |
|-------------|---------|
| `linkdeveloper-product_run_bootstrap` | Product run bootstrap |
| `linkdeveloper-issue_dispatch` | Issue dispatch |
| `linkdeveloper-validation_record` | Validation record |
| `linkdeveloper-artifact_write` | Artifact write |
| `linkdeveloper-run_validation` | Run validation |
| `linkdeveloper-status_sync` | Status sync |
| `linkdeveloper-starter_generation` | Starter generation |
| `linkdeveloper-notification` | Notification |
| `linkdeveloper-report_generation` | Report generation |
| `linkdeveloper-run_task` | Run task |
| `linkdeveloper-deploy_scaffold` | Deploy scaffold |

**Import runbook:** Wave 4.7 — `import-automation-templates` on linkdroplet-00 n8n.

---

## 4. LLM Council capability

| Capability | Connector | Service |
|------------|-----------|---------|
| `cap.llm_council.deliberation` | `LiNKskills/capability-connectors/llm-council/` | `link-llm-council` API on linkdroplet-00 |

Gates G1–G5 invoked via unified dispatch (`runtime_tier: council`). Base Client subscription includes council entitlement (`llm_council_entitled: true` on provision).

---

## 5. Sign-off checklist

| Item | Status | Evidence |
|------|--------|----------|
| 5 OpenClaw profiles configured | **PASS** | `fleet-v1-openclaw.ts`, LiNKbot-core deploy |
| 8 Agent Zero lanes registered | **PASS** | `agent-zero-lanes.ts`, AZ adapter tests |
| LinkSites + suitegen + linkdeveloper templates in manifest | **PASS** | LiNKautowork `manifest.json` |
| Council capability contract | **PASS** | LinkSkills connector + dispatch path |
| Tenant isolation enforced in kernel | **PASS** | `tenant-isolation.test.ts` |
| Admin fleet dashboard static registry | **PASS** | `fleet-dashboard.ts` |

**Fleet proof:** **PASS** for DigitalOcean acceptance gate (Wave 11).  
**Wave 12 Hetzner:** **DEFERRED** until Principal Release OK (11.7) and Hetzner account ready.

---

## References

- `LiNKdev/product/reports/linktrend-system/STUDIO_FORWARD_PLAN.md`
- `LiNKdev/product/reports/linktrend-system/wave11-do-acceptance.md`
- `deploy/README.md`
