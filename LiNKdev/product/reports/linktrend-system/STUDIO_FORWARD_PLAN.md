# LiNKtrend Studio — Forward Plan (v1 production)

**Status:** Principal-approved operating plan (supersedes Codex addendum §14 and ad-hoc sequencing)  
**Date:** 2026-06-05  
**Audience:** Principal, implementers, factory agents  
**Scope:** LiNKtrend System (LiNKaios Admin + Client), LiNKbot-core, link-agentzero, LiNKautowork, LiNKsites, LiNKsuitegen, LiNKdeveloper

---

## 0. Executive summary

LiNKtrend ships as **LiNKaios Admin** (vendor) + **LiNKaios Client** (licensees). The first Client tenant is **Linktrend** (studio operating its own business). **MVO Area 1** (LinkSites E2E) has passed; this plan takes the studio from **staging proof** to **production-ready v1** under the fleet, suite, and runtime model agreed after the Codex LiNKdeveloper addendum and subsequent Principal sessions.

**Launch hosting:** Deploy and test on **existing DigitalOcean droplets** (`linkdroplet-00`, `linkdroplet-01`) first. After acceptance, migrate to **two Hetzner EX44 64 GB VPS** (compute + collaboration split) when the Hetzner account is ready. This is **viable** — same compose topology, GSM env render, Tailscale DNS; only host sizing and provider change.

**Fleet v1 (OpenClaw profiles on one gateway):**

| Tenant | OpenClaw profiles | Count |
|--------|-------------------|-------|
| Admin (vendor) | `admin-openclaw` (vendor + LiNKsuitegen head) | 1 |
| Client (Linktrend) | `ceo-client`, `linksites-head`, `linkdeveloper-orchestrator`, `linkdeveloper-steward` | 4 |
| **Total** | Single `openclaw-gateway` process | **5** |

**Agent Zero:** eight named lanes from day one (deterministic issue → lane map). **Not** experimental “try sub-agents first.”

**LiNKdeveloper placement:** **Client tenant** for Linktrend (not Admin). **LiNKsuitegen** remains **Admin-only**.

**LLM Council:** Shared platform service — [karpathy/llm-council](https://github.com/karpathy/llm-council) via `link-llm-council` fork and `cap.llm_council.deliberation`.

---

## 1. Locked architecture decisions

### 1.1 Suite and module packaging

- **Suite** = department (one OpenClaw **head** per subscribed suite).
- **Modules** = subscribe on/off inside suite; full suite designed for integration; partial suite allowed with documented manual inputs.
- **Base LiNKaios Client subscription** includes **CEO OpenClaw** + **LLM Council access**.
- Suite subscription = **≥1 module** + suite head OpenClaw (except utility-only packs later).
- **Suite roles** in templates ≠ OpenClaw profiles; mapping files define runtime.

### 1.2 Runtime ladder (deterministic)

For each **issue**, assign exactly one primary runtime:

1. **LiNKautowork** — deterministic, repeatable, scriptable.
2. **Agent Zero lane** — persistent or adequate multi-step tool/CLI work (see §1.4).
3. **OpenClaw sub-agent** — bounded burst under a suite head (draft, parallel research).
4. **OpenClaw head / CEO / steward** — ongoing human relationship, orchestration, Zulip.
5. **Codex / Cursor lane** — governed code implementation (LiNKdeveloper modules 6–7).
6. **LLM Council** — gate deliberation (G1–G5), not a resident bot.

### 1.3 LiNKdeveloper leadership (supersedes Codex addendum §11.1 peer model)

- **Suite orchestrator** = head of LiNKdeveloper factory suite (OpenClaw); reports to CEO.
- **Product steward** = OpenClaw subordinate during factory; Zulip-capable; **graduates** with product to product repo/suite.
- Steward is **never** Agent Zero.

### 1.4 Agent Zero lanes (deploy at v1)

| Lane ID | Serves |
|---------|--------|
| `az-librarian` | LiNKbrain librarian ingest/propose |
| `az-suitegen-factory` | LiNKsuitegen factory analyst roles |
| `az-linksites-research` | LinkSites lead scout (live), enrichment |
| `az-linksites-build` | LinkSites website builder |
| `az-linkdeveloper-analysis` | Market, requirements |
| `az-linkdeveloper-architecture` | Architecture, platform |
| `az-linkdeveloper-validation` | QA, security |
| `az-linkdeveloper-ops` | DevOps |

### 1.5 Gateway and tenant isolation

- **v1:** One `openclaw-gateway` on linkdroplet-00, five profiles.
- **Tenant isolation:** LiNKaios enforces `tenant_id` on every agent-run, lease, brain context, Zulip route — not OpenClaw alone.
- **First independent client:** Add **second gateway** on same VPS (studio vs client gateway).
- **Regulated tier:** Dedicated gateway + optional dedicated node.

### 1.6 Communications

- **Zulip** and **LiNKaios inbox** are **dual-channel parity** (Admin and Client).
- Vendor suites use the same employee model as Client suites for bot comms.

### 1.7 Hosting phases

| Phase | Host | Nodes |
|-------|------|-------|
| **A — Launch & test** | DigitalOcean | `linkdroplet-00` (apps/agents), `linkdroplet-01` (Zulip/Plane/Odoo) |
| **B — Scale** | Hetzner | 2× EX44 64 GB (compute + collaboration), same split |

---

## 2. Repository ownership matrix

| Repo | Owns |
|------|------|
| **LiNKtrend-System** | LiNKaios UI/kernel, suite declarations, LiNKbot role mappings, LinkSkills connectors, migrations, deploy compose, fleet policy docs |
| **LiNKbot-core** | OpenClaw fork, `openclaw.json`, workspaces, gateway production config |
| **link-agentzero** | Agent Zero fork, worker container, LiNKtrend adapter hooks |
| **LiNKautowork** | n8n templates, gateway workflows, ingress handlers |
| **LiNKsites** | Payload CMS, templates, publish pipeline |
| **LiNKsuitegen** | Factory API, workers, suite catalogue generation |
| **LiNKdeveloper** | Product-run runtime, orchestrator heartbeat, executor adapters, manifest |
| **link-llm-council** | Council FastAPI service (3-stage deliberation) |

---

## 3. Wave plan (implementation order)

Waves are sequential unless marked **parallel**. Each wave lists deliverables, acceptance criteria, and primary repo.

---

### Wave 0 — Policy lock and supersede Codex §14

**Repos:** LiNKtrend-System, LiNKdeveloper

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 0.1 | This document (`STUDIO_FORWARD_PLAN.md`) committed | Principal can trace all decisions |
| 0.2 | `docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md` | Fleet, gateway, AZ lanes, suite packaging |
| 0.3 | Addendum §14 replaced with pointer to this plan | No conflicting priority list |
| 0.4 | Update `suites/linkdeveloper/` visibility: Client entitlement for `linktrend` slug; Admin keeps UI routes only if operator cross-tenant | Registry + README aligned |
| 0.5 | Update `IMPLEMENTATION_PACKAGE_INDEX.md` non-negotiables (admin-only → client placement) | Docs consistent |

---

### Wave 1 — OpenClaw production fleet (LiNKbot-core)

**Repos:** LiNKbot-core, LiNKtrend-System

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 1.1 | Replace `deploy/prod/openclaw.json` agent list with five profiles: `admin-openclaw`, `ceo-client`, `linksites-head`, `linkdeveloper-orchestrator`, `linkdeveloper-steward` | Remove legacy `linksites-builder`, `linksites-ops`, `lisa`, `librarian`, `linksuitegen-orchestrator`, `linksuitegen-factory` |
| 1.2 | Create workspaces under `deploy/prod/workspaces/` for each profile (SOUL.md, AGENTS.md, persona overlays) | `openclaw doctor` clean |
| 1.3 | Sub-agent defaults: cheaper model for `agents.defaults.subagents` | Documented in workspace README |
| 1.4 | Zulip channel profiles per agent (communication profile ids in LiNKtrend-System) | Governed send smoke per agent |
| 1.5 | `LiNKbot/roles/suites/linksites/openclaw-mapping.ts` — all suite roles → `linksites-head` | Unit tests |
| 1.6 | `LiNKbot/roles/suites/linkdeveloper/openclaw-mapping.ts` — orchestrator + steward only | Unit tests |
| 1.7 | Update `LiNKbot/roles/suites/linksuitegen/openclaw-mapping.ts` — orchestrator roles → `admin-openclaw`; factory roles → Agent Zero (remove `linksuitegen-factory` OpenClaw) | Mapping tests |
| 1.8 | Update `suite-role-openclaw.ts` barrel imports | bot-runtime resolves correct `agentId` |
| 1.9 | VPS bootstrap: `ops/bootstrap-linkbot-state.sh` seeds five agents | Smoke `agent-run` per profile on linkdroplet-00 |
| 1.10 | `deploy/README.md` agent list updated | Ops doc matches config |

---

### Wave 2 — Agent Zero production (link-agentzero + LiNKtrend adapter)

**Repos:** link-agentzero, LiNKtrend-System, LiNKbot-core (ingress only if needed)

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 2.1 | LiNKtrend fork hygiene: branches `development`/`staging`/`main`, upstream sync policy | Same as other `link-*` forks |
| 2.2 | `LiNKbot/runtime-adapters/agent-zero/` adapter implementing LiNKbot adapter contract (session, mission, lease, event, terminate) | Typecheck + contract tests |
| 2.3 | `LiNKbot/roles/platform/agent-zero-lanes.ts` — lane IDs + queue names | Eight lanes from §1.4 |
| 2.4 | Per-suite `agent-zero-mapping.ts` for linksites, linksuitegen, linkdeveloper, platform/librarian | Deterministic role → lane |
| 2.5 | `deploy/docker/agent-zero.Dockerfile` + compose service on linkdroplet-00 | Health endpoint |
| 2.6 | GSM secrets: OpenRouter (shared), lane config env | `.env.example` only |
| 2.7 | LiNKguard residue cleanup hook on AZ runs | Audit event per run |
| 2.8 | bot-runtime dispatch: if mapping says `agent_zero`, route to AZ adapter not OpenClaw | Integration test |

---

### Wave 3 — LLM Council capability (link-llm-council + LinkSkills)

**Repos:** link-llm-council, LiNKtrend-System

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 3.1 | Production compose for council API (no dev Vite UI required on VPS) | `POST /deliberate` or existing backend route |
| 3.2 | `LiNKskills/capability-connectors/llm-council/` — `cap.llm_council.deliberation` live mode | Lease + audit |
| 3.3 | Port LiNKdev council gate schemas (`G1`–`G5`) to LiNKdeveloper + linksuitegen gate callers | Validator passes sample reports |
| 3.4 | LiNKaios Admin + Client: council invocation UI hook on approval gates (read-only result + blockers) | Inbox shows council summary |
| 3.5 | Base Client subscription includes council entitlement flag | Tenant provision sets flag |

---

### Wave 4 — LiNKautowork production automations

**Repos:** LiNKautowork, LiNKtrend-System, LiNKdeveloper

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 4.1 | **LinkSites** — verify all templates imported on VPS: `artifact_write_local`, `supabase_mirror_upsert`, `payload_sync_local`, `preview_readiness_check`, `crm_ready_to_contact_mark` | Gateway workflow run + audit |
| 4.2 | **LiNKsuitegen** — verify all seven factory templates + CRM proof templates imported | Orchestrator cycle smoke |
| 4.3 | **LiNKdeveloper** — create n8n templates for adapter keys: `run_validation`, `status_sync`, `starter_generation`, `notification`, `report_generation`, `run_task`, `deploy_scaffold` | Each webhook returns governed run record |
| 4.4 | **LiNKdeveloper** — create n8n templates for workflow map handles: `product_run_bootstrap`, `issue_dispatch`, `validation_record`, `artifact_write` | Align `workflows.ts` + `suites/linkdeveloper/workflow.md` |
| 4.5 | `LiNKautowork/gateway/src/workflows/linkdeveloper.ts` — ingress handlers | Parity with linksuitegen.ts pattern |
| 4.6 | `automations/templates/manifest.json` updated | CI manifest check |
| 4.7 | VPS: `import-automation-templates` runbook executed on linkdroplet-00 n8n | Template list matches manifest |

---

### Wave 5 — LiNKtrend System: platform kernel and fleet wiring

**Repos:** LiNKtrend-System

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 5.1 | `docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md` cross-linked from `.cursor/rules/` | Agents read policy |
| 5.2 | Tenant provision: CEO profile + council flag on Client create | Admin tenant gets `admin-openclaw` binding |
| 5.3 | Suite subscribe: module entitlements + suite head OpenClaw slot allocation | Kernel rejects over-cap |
| 5.4 | `runtime_tier` field on issue templates in suite manifests (`automation` \| `agent_zero` \| `openclaw_head` \| `openclaw_subagent` \| `codex_lane` \| `council`) | Validation script |
| 5.5 | bot-runtime: unified dispatch router (OpenClaw / AZ / autowork / codex) | Trace shows runtime chosen |
| 5.6 | Tenant isolation test suite: two tenants, prove no brain cross-read | CI green |
| 5.7 | Migrations: any `openclaw_agent_id` / fleet slot columns if missing | Applied on staging Supabase |
| 5.8 | `LINKDEVELOPER_SERVICE_URL` live on VPS (not in-memory stub) | Admin/Client API reaches service |

---

### Wave 6 — LiNKaios Admin (vendor tenant)

**Repos:** LiNKtrend-System, LiNKsuitegen

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 6.1 | Admin CEO binding → `admin-openclaw` (Zulip + inbox) | Operator can message vendor bot |
| 6.2 | **LiNKsuitegen** — factory API + workers deployed on linkdroplet-00 | `POST /v1/orchestrator/cycle` smoke |
| 6.3 | LiNKsuitegen Admin UI: generate variant command, candidates, machine review, publish | Publish writes `linkaios_kernel.plugins` |
| 6.4 | **Suites marketplace** — replace demo `localStorage` catalogue with DB-backed publish from LiNKsuitegen | Stripe shadow → live per approval |
| 6.5 | Fleet dashboard: OpenClaw profiles, AZ lanes, last run, RAM note | Admin visibility |
| 6.6 | Remove LiNKdeveloper from Admin **operator default nav** (optional cross-tenant link for support only) | Client owns factory UX |
| 6.7 | Librarian loop: AZ lane `az-librarian` replaces OpenClaw `librarian` profile | LTS-021 proof re-run |

---

### Wave 7 — LiNKaios Client (Linktrend tenant)

**Repos:** LiNKtrend-System, LiNKsites, LiNKdeveloper

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 7.1 | Client tenant `linktrend` (or calusa slug per env) with CEO `ceo-client` | Zulip stream for executive |
| 7.2 | **LinkSites** suite subscribed (all modules MVO) | Marketplace subscribe flow |
| 7.3 | **LiNKdeveloper** suite subscribed on Client only | Not in client marketplace for other tenants until opened |
| 7.4 | Project surfaces: Zulip stream per project; inbox parity | Approval from both channels |
| 7.5 | Company → Modules panel wired to real entitlements (D-10) | Per-module subscribe |
| 7.6 | Cockpit / work / projects show LinkSites + LiNKdeveloper runs | Trace correlation |

---

### Wave 8 — LiNKdeveloper runtime (addendum + Principal sessions)

**Repos:** LiNKdeveloper, LiNKtrend-System

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 8.1 | **Pre-qualification (G1):** Product Steward packet → council → human go/no-go **before** work graph explosion | State machine blocks G2 without pass |
| 8.2 | **Persistent orchestrator:** production heartbeat worker on VPS (not test-only) | Event-driven promote/dispatch |
| 8.3 | **Laws + gates G1–G5** in runtime (not docs only) | Blocker stops graph |
| 8.4 | **Executor routing v2:** `EXECUTOR_ROUTING_POLICY.md` uses `runtime_tier` + AZ lanes | No ambiguous “Market LiNKbot” |
| 8.5 | **Zulip-first** product run stream; steward as conversational persona; orchestrator head | Dual inbox |
| 8.6 | **Solution composition** (multi-kit / OSS) in platform module | Not single-kit only |
| 8.7 | **LinkApps starter** promoted to `approved` in starter registry | Default kit for greenfield |
| 8.8 | **External repo output:** `target_repo_url` on product runs; artifacts in GitHub/Mac Mini SSH | No code in LiNKaios monorepo |
| 8.9 | **Factory learning (wave 8b):** post-ship asset extraction to library | Optional if 8.1–8.8 slip schedule |
| 8.10 | Deploy LiNKdeveloper service + heartbeat on linkdroplet-00 | `LINKDEVELOPER_SERVICE_URL` smoke |
| 8.11 | Admin UI project workspace tabs (Overview, Plan, Build, Validation, Launch, Activity) on **Client** surface for LiNKdeveloper | Addendum §5 UX |

---

### Wave 9 — LinkSites production (LiNKsites repo)

**Repos:** LiNKsites, LiNKtrend-System, LiNKautowork

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 9.1 | CMS docker build fixed on VPS (lockfile context) | Image builds on linkdroplet-00 |
| 9.2 | Traefik wildcard `*.linktrend.internal` for per-site preview | Preview URL 200 |
| 9.3 | `linksites-head` drives MVO loop with AZ lanes for research/build | Area 1 re-proof |
| 9.4 | Outreach governed send path (draft vs approved) | Trace + lease |
| 9.5 | Kernel 13/13 stages green on staging after fleet migration | `mvo-latest-run.json` updated |

---

### Wave 10 — LiNKsuitegen production (LiNKsuitegen repo)

**Repos:** LiNKsuitegen, LiNKtrend-System

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 10.1 | Factory API systemd/compose on VPS `:3099` | Admin dispatch smoke |
| 10.2 | Continuous discovery cron policy documented + enabled | Orchestrator cycle nightly or on-demand |
| 10.3 | `simple_crm_lead_odoo_shadow` proof through Admin publish | Suite appears in marketplace DB |
| 10.4 | Factory analyst roles on `az-suitegen-factory` only | No OpenClaw factory profile |
| 10.5 | OpenClaw `admin-openclaw` promotes modules between factory phases | Audit chain complete |

---

### Wave 11 — DigitalOcean acceptance (gate before Hetzner)

**Repos:** all

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 11.1 | **Fleet proof doc** — list all 5 OC profiles, 8 AZ lanes, automations, council | Single markdown sign-off |
| 11.2 | Admin: LiNKsuitegen cycle → publish candidate | DB row |
| 11.3 | Client: LinkSites MVO re-run PASS | 13/13 |
| 11.4 | Client: LiNKdeveloper pilot product run (Hello World or LinkApps kit) through G2 | Trace + Zulip |
| 11.5 | RAM snapshot on linkdroplet-00 under load (`free -h`, peak document) | Principal review |
| 11.6 | Tenant isolation test on DO | Two test tenants |
| 11.7 | Principal **Release OK** for staging → production promotion on DO | Human gate |

---

### Wave 12 — Hetzner migration (after Wave 11 + Hetzner account)

**Repos:** ops runbooks (LiNKtrend-System `deploy/`)

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 12.1 | Provision 2× Hetzner EX44 64 GB, Tailscale join, same hostnames or cutover plan | SSH + tailscale ping |
| 12.2 | Install Docker, Traefik, internal CA (copy from link-traefik runbook) | HTTPS internal |
| 12.3 | Parallel deploy: render GSM env on Hetzner, `docker compose up` both nodes | Health URLs green |
| 12.4 | Supabase remains cloud; update webhook URLs if public endpoints change | Zulip/Plane callbacks |
| 12.5 | Data migration: volumes (OpenClaw state, n8n, CMS media) — rsync or restore from backup | Stateful continuity |
| 12.6 | DNS/Tailscale cutover window; DO droplets standby 48h | Rollback documented |
| 12.7 | Re-run Wave 11.2–11.4 on Hetzner | Parity proof |
| 12.8 | Decommission or downsize DO droplets | Cost confirmation |

---

## 4. Deterministic issue → runtime maps (v1)

### 4.1 LinkSites (`linksites-head` OpenClaw)

| Issue / role | Runtime |
|--------------|---------|
| `linksites-head` | OpenClaw |
| `lead_scout_bot` (MVO mock) | LiNKautowork |
| `lead_scout_bot` (live) | `az-linksites-research` |
| `research_enrichment_bot` | `az-linksites-research` |
| `website_builder_bot` | `az-linksites-build` |
| `outreach_bot` | AZ draft + head send, or sub-agent draft |
| Publish sub-stages | LiNKautowork handles |

### 4.2 LiNKdeveloper (orchestrator + steward OpenClaw)

| Issue / role | Runtime |
|--------------|---------|
| `suite_orchestrator_linkbot` | OpenClaw `linkdeveloper-orchestrator` |
| `product_steward_linkbot` | OpenClaw `linkdeveloper-steward` |
| `market_linkbot`, `requirements_linkbot` | `az-linkdeveloper-analysis` |
| `architecture_linkbot`, `platform_linkbot` | `az-linkdeveloper-architecture` |
| `qa_linkbot`, `security_linkbot` | `az-linkdeveloper-validation` |
| `devops_linkbot` | `az-linkdeveloper-ops` + LiNKautowork deploy |
| Code implementation | Codex/Cursor lane |
| Bootstrap, validation, artifacts | LiNKautowork |

### 4.3 LiNKsuitegen (`admin-openclaw` OpenClaw)

| Issue / role | Runtime |
|--------------|---------|
| `suitegen_orchestrator_linkbot`, `handoff_coordinator_linkbot` | OpenClaw `admin-openclaw` |
| Factory analyst roles | `az-suitegen-factory` |
| All `autowork.linksuitegen.*` | LiNKautowork |

### 4.4 Platform

| Issue / role | Runtime |
|--------------|---------|
| `librarian_bot` | `az-librarian` |
| Council gates | `cap.llm_council.deliberation` |
| Admin CEO / Client CEO | `admin-openclaw` / `ceo-client` |

---

## 5. VPS layout (both DO and Hetzner)

### Node A — compute (`linkdroplet-00` → Hetzner compute)

- Traefik (or edge on A)
- LiNKaios stack (linkaios-web, zulip-gateway, linkskills, bot-runtime, linkguard)
- `openclaw-gateway` (5 profiles)
- `link-agentzero` worker
- `link-llm-council` API
- LiNKautowork n8n + gateway
- Payload CMS (LinkSites)
- LiNKdeveloper service + heartbeat
- LiNKsuitegen factory API/workers
- Future: Postiz, content-suite containers

### Node B — collaboration (`linkdroplet-01` → Hetzner collaboration)

- Zulip
- Plane
- Odoo
- Future: Listmonk, Typebot, other forks

**RAM note:** 16 GB on DO node A is minimum; monitor Wave 11.5. Hetzner 64 GB per node removes headroom anxiety.

---

## 6. Codex addendum carry-forward (what changes)

| Addendum topic | Forward plan wave |
|----------------|-------------------|
| Pre-development qualification | Wave 8.1 |
| Persistent event-driven runtime | Wave 8.2 |
| LiNKdev laws/gates without GitHub bus | Wave 8.3 |
| Shared council | Wave 3 |
| Runtime cost discipline | Waves 1–2, policy doc |
| Factory learning | Wave 8.9 |
| Product Steward + Orchestrator | Wave 1 + 8; orchestrator **head**, steward **subordinate** |
| Admin project workspace UX | Wave 8.11 on **Client** |

**Superseded:** Addendum §14 numbered list — use **Wave 0–12** in this document instead.

---

## 7. Risk register

| Risk | Mitigation |
|------|------------|
| DO 16 GB OOM under parallel AZ + sub-agents | Cap concurrent lanes; Wave 11.5; Hetzner migration |
| Tenant bleed on shared gateway | Wave 5.6 isolation tests; second gateway for independent client |
| LiNKdeveloper service not on VPS | Wave 5.8 + 8.10 |
| linkdeveloper n8n templates missing | Wave 4.3–4.4 |
| CMS docker build fail | Wave 9.1 |
| Council not wired | Wave 3 before LiNKdeveloper G1 live |
| Independent client onboarding | Wave 12+ gateway split policy |

---

## 8. Definition of done (studio v1)

- [ ] Five OpenClaw profiles production-ready on DO  
- [ ] Eight Agent Zero lanes production-ready on DO  
- [ ] LLM Council live invocations at gates  
- [ ] All LinkSites + LiNKsuitegen + LiNKdeveloper automations imported  
- [ ] Admin: LiNKsuitegen publish to marketplace DB  
- [ ] Client (Linktrend): LinkSites MVO PASS + LiNKdeveloper G2 pilot  
- [ ] LiNKdeveloper on Client, not Admin operator path  
- [ ] Dual-channel Zulip + inbox approvals  
- [ ] Tenant isolation tested  
- [ ] Principal Release OK on DO  
- [ ] Hetzner migration runbook executed (when account ready)  

---

## 9. References

- `LiNKdeveloper/docs/LINKDEVELOPER_RUNTIME_AND_OPERATING_MODEL_ADDENDUM.md`
- `LiNKdeveloper/docs/IMPLEMENTATION_PACKAGE_INDEX.md`
- `LiNKdev/product/reports/linktrend-system/MVO_AREA1_PROOF_2026-06-02.md`
- `LiNKbot/roles/suites/linksuitegen/openclaw-mapping.ts`
- `deploy/README.md`
- [karpathy/llm-council](https://github.com/karpathy/llm-council)

---

*Maintainer: update this file when waves complete; do not fork competing priority lists in other docs.*
