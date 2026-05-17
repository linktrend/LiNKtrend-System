# LiNKapps capability plugin contracts (declaration-only)

**Status:** WP-112 — connector contract manifests only; no live providers.  
**Canonical spec:** `LINKAPPS_CAPABILITY_REQUIREMENTS.md`, `CONTRACTS_MVO.md` §0.A.5.1, `plugins/vertical/linkapps/manifest.yaml`.  
**Manifest paths:** `packages/linkaios-kernel/plugins/capabilities/linkapps/*.yaml`

## Default posture

Every manifest sets `default_execution_mode: mock` and `live_execution_policy.status: disabled_by_default`. Side-effecting SaaS mutations (GitHub remote push, cloud Supabase project create, live Stripe catalogue, Vercel CDN publish, EAS cloud build, live Plane writes, real Zulip outbound) require **explicit tenant opt-in** and **distinct lease rows** in future implementation — never silent defaults.

## Capability ID → Phase 5 stage mapping (`linkapps.app_factory`)

Mapping is illustrative for app-factory orchestration; multiple capabilities participate per stage via LiNKautowork hooks.

| `capability_id` | Primary `stage_id` (from vertical manifest) | Notes |
|-----------------|-----------------------------------------------|-------|
| `cap.github.repo_management` | `linkapps.phase5.repo_generation` | Template materialization, local git, commits; upstream push future-only. |
| `cap.supabase.provisioning` | `linkapps.phase5.service_provisioning` | Stub project ref, workspace migrations, mock RLS; cloud org create future-only. |
| `cap.stripe.product_management` | `linkapps.phase5.service_provisioning` | Mock catalogue/price/webhook stub rows. |
| `cap.plane.execution_tracking` | `linkapps.phase5.squad_formation`, `linkapps.phase5.quality_validation` | Mock projects/tasks/sprint counters; operators use Plane read views via readiness probes (shadow). |
| `cap.vercel.deployment` | `linkapps.phase5.deployment` | Record local build outputs and mock preview URLs. |
| `cap.eas.build` | `linkapps.phase5.deployment` | Skip placeholders by default; real EAS future-only. |
| `cap.zulip.run_messaging` | All stages (operator visibility) | Mock-queued notifications; live send future-only. |

Cross-vertical capabilities declared on the vertical manifest (`cap.research.public_web`, `cap.asset.generation`, `cap.postiz.distribution`) reuse **LinkSites / shared** contract manifests elsewhere; this packet does not duplicate them under `linkapps/`.

## Idempotency and kill switches

- Idempotency key template and per-operation `stable_scope_segment` values are embedded in each YAML (`idempotency_rules`), aligned with `LINKAPPS_CAPABILITY_REQUIREMENTS.md` §4.
- Each manifest registers `kill_switch_registration` per requirements §6 (`capability_kill_switch` scope).

## Failure mapping

Per-manifest `failure_mapping` sections normalize provider errors to §5.4 primitives (`LEASE_REQUEST_INVALID`, `LEASE_DENIED`, `INTEGRATION_AUTH_FAILED`, etc.) per `LINKAPPS_CAPABILITY_REQUIREMENTS.md` §5.
