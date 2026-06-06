# Fleet and runtime policy (v1)

**Status:** Principal-approved (STUDIO_FORWARD_PLAN Wave 0.2 / Wave 5)  
**Date:** 2026-06-06  
**Scope:** LiNKtrend System — OpenClaw gateway, Agent Zero lanes, runtime ladder, tenant isolation

---

## 1. Fleet v1 (single gateway)

One `openclaw-gateway` process on compute node A (`linkdroplet-00`) hosts **five OpenClaw profiles**:

| Profile | Tenant | Role |
|---------|--------|------|
| `admin-openclaw` | Admin (vendor) | Vendor CEO + LiNKsuitegen head |
| `ceo-client` | Client | Base Client subscription CEO |
| `linksites-head` | Client | LinkSites suite head |
| `linkdeveloper-orchestrator` | Client | LiNKdeveloper factory orchestrator |
| `linkdeveloper-steward` | Client | LiNKdeveloper product steward |

**Agent Zero:** eight named lanes (`az-librarian`, `az-suitegen-factory`, `az-linksites-research`, `az-linksites-build`, four `az-linkdeveloper-*`). Canonical IDs live in `LiNKbot/roles/platform/agent-zero-lanes.ts`.

---

## 2. Runtime ladder (deterministic)

Each **issue** assigns exactly one primary `runtime_tier`:

| Tier | Plane | When |
|------|-------|------|
| `automation` | LiNKautowork | Deterministic, repeatable workflow steps |
| `agent_zero` | Agent Zero lane | Multi-step tool/CLI judgment work |
| `openclaw_subagent` | OpenClaw (burst) | Bounded draft / parallel research under suite head |
| `openclaw_head` | OpenClaw profile | Ongoing orchestration, Zulip, governed send |
| `codex_lane` | Codex / Cursor | Governed code implementation (LiNKdeveloper modules 6–7) |
| `council` | LLM Council capability | Gate deliberation G1–G5 only |

Issue templates declare `runtime_tier` in suite manifests (`LiNKaios/linkaios-web/src/lib/kernel/fleet/issue-templates.ts`). Validation: `node scripts/validate-runtime-tiers.mjs`.

---

## 3. Tenant provisioning

| Tenant kind | On create | Council |
|-------------|-----------|---------|
| **admin** | Bind `admin-openclaw` fleet slot | Optional (vendor gates) |
| **client** | Bind `ceo-client` + `llm_council_entitled: true` (base subscription) | Included |

Kernel RPC: `linkaios_kernel.provision_tenant_fleet` (see migration `20260606120000_wave5_fleet_kernel.sql`).

---

## 4. Suite subscribe and fleet slots

Subscribing a suite allocates OpenClaw head slot(s) and module entitlements:

| Suite | Additional OpenClaw slots | Notes |
|-------|---------------------------|-------|
| LinkSites | `linksites-head` (1) | Research/build on AZ lanes |
| LiNKdeveloper | `linkdeveloper-orchestrator`, `linkdeveloper-steward` (2) | Client tenant only |
| LiNKsuitegen | 0 (uses `admin-openclaw`) | Admin-only suite |

Kernel rejects subscribe when tenant would exceed allowed slots or global gateway cap (5 profiles). RPC: `linkaios_kernel.subscribe_suite_fleet`.

---

## 5. Tenant isolation

LiNKaios enforces `tenant_id` on every agent-run, lease, brain context assembly, and Zulip route — **not OpenClaw alone**.

- Brain context queries MUST scope by `tenant_id`; cross-tenant reads are rejected (`assertBrainContextTenantScope`).
- Fleet bindings are tenant-scoped rows in `linkaios_kernel.tenant_fleet_bindings`.
- CI: `LiNKaios/linkaios-web/src/lib/kernel/fleet/tenant-isolation.test.ts`.

First independent client tenant: add second gateway (future). Regulated tier: dedicated gateway + optional node.

---

## 6. Unified dispatch

`LiNKbot/runtime-adapters/openclaw/bot-runtime/src/unified-dispatch.ts` routes issue execution by `runtime_tier` or role mapping:

- `automation` → LiNKautowork workflow handle (trace ref)
- `agent_zero` → Agent Zero adapter
- `openclaw_head` / `openclaw_subagent` → OpenClaw handoff with fleet `agentId`
- `codex_lane` → governed coding lane (trace only until live ACP)
- `council` → `cap.llm_council.deliberation` lease path

Trace payloads include `runtime_chosen` for LiNKaios visibility.

---

## 7. External service URLs (VPS)

| Variable | Service |
|----------|---------|
| `LINKDEVELOPER_SERVICE_URL` | LiNKdeveloper HTTP API (Wave 5.8 — not in-memory stub when set) |
| `OPENCLAW_AGENT_RUN_URL` | OpenClaw gateway agent ingress |
| `AGENT_ZERO_WORKER_URL` | link-agentzero worker health/dispatch |

Hetzner migration deferred until Wave 11 acceptance on DigitalOcean.

---

## References

- `LiNKdev/product/reports/linktrend-system/STUDIO_FORWARD_PLAN.md`
- `LiNKbot/roles/platform/fleet-v1-openclaw.ts`
- `LiNKbot/roles/platform/agent-zero-lanes.ts`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`
