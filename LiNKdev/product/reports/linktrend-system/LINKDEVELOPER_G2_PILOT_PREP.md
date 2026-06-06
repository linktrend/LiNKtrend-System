# LiNKdeveloper G2 pilot prep (Wave 11.4)

**Date:** 2026-06-06  
**Tenant:** Client `linktrend` (Linktrend studio)  
**Suite:** `linkdeveloper` (Client-only subscribe)  
**Target:** Product run through **G2** (post–G1 council) with trace + Zulip evidence

This document prepares the pilot; full VPS execution follows Principal Release OK (11.7) when approved.

---

## Pilot options

| Kit | When to use | Starter registry |
|-----|-------------|------------------|
| **Hello World** | Minimal path — prove orchestrator + steward + G2 gate | Lightweight product run |
| **LinkApps** | Default greenfield kit (Wave 8.7) | `approved` in starter registry |

Recommendation: **Hello World** for first DO acceptance trace; promote to LinkApps kit after G2 PASS.

---

## Preconditions (local — automated)

```bash
./scripts/run-linkdeveloper-g2-pilot-prep.sh
```

Checks:

1. `suites/linkdeveloper/` manifest + `runtime_tier` on issue templates
2. OpenClaw mappings: `linkdeveloper-orchestrator`, `linkdeveloper-steward`
3. Agent Zero lanes: `az-linkdeveloper-analysis` … `az-linkdeveloper-ops`
4. Client tenant subscribe guards (not Admin operator path)
5. LiNKautowork workflow handles in `automations/templates/manifest.json`

---

## G1 → G2 state machine

| Gate | Runtime | Blocker |
|------|---------|---------|
| **G1** | Product Steward packet → `cap.llm_council.deliberation` → Principal go/no-go | Blocks work graph explosion without PASS |
| **G2** | Council deliberation on scope/architecture packet | Blocks dispatch to AZ/Codex lanes without PASS |

Validator: `LiNKdev/factory/scripts/validate-council.sh <report.json> --gate G2`

---

## VPS execution steps (when approved)

1. **Subscribe** LiNKdeveloper on Client tenant (already wired Wave 7).
2. **Bootstrap** product run via `autowork.linkdeveloper.product_run_bootstrap`.
3. **G1:** Steward submits pre-qualification packet; council + Principal approval.
4. **G2:** Orchestrator promotes to architecture/requirements phase; council G2 PASS required.
5. **Trace:** LiNKaios project detail + `linkaios.traces` correlation.
6. **Zulip:** Stream per project; steward conversational thread; topic for G2 gate result.

### Service URLs (linkdroplet-00)

| Variable | Purpose |
|----------|---------|
| `LINKDEVELOPER_SERVICE_URL` | LiNKdeveloper HTTP API (not in-memory stub) |
| `OPENCLAW_AGENT_RUN_URL` | Orchestrator / steward dispatch |
| `AGENT_ZERO_WORKER_URL` | Analysis / validation lanes |

---

## Acceptance criteria (11.4)

| Criterion | Evidence |
|-----------|----------|
| Product run created on Client | `linkdeveloper.product_runs` row + trace |
| G1 PASS before G2 | Council report JSON under `product/reports/.../council/` |
| G2 council PASS | `validate-council.sh --gate G2` on live report |
| Zulip thread | Project stream message referencing run + gate |
| No Admin operator default path | Factory UX on Client surface only (Wave 6.6) |

---

## References

- `suites/linkdeveloper/workflow.md`
- `STUDIO_FORWARD_PLAN.md` Wave 8.1–8.3, 11.4
- `docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md`
