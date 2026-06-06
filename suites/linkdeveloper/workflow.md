# LiNKdeveloper — canonical workflow map

**Suite:** `linkdeveloper`  
**Sources:** `LiNKdeveloper/manifest/linkdeveloper.suite.json`, `docs/LINKDEVELOPER_AS_SUITE_MAP.md`, `docs/SOFTWARE_DEVELOPMENT_LIFECYCLE_MODEL.md`  
**External repo:** `https://github.com/linktrend/LiNKdeveloper` (`/Users/linktrend/Projects/LiNKdeveloper`)

Readable spine for the **ten-module software development lifecycle**. Judgment work is LiNKbot; deterministic validation and bootstrap steps are LiNKautowork; leases are LinkSkills; narrative memory is LiNKbrain; routing and Client UI is LiNKaios. **Client tenant (Linktrend) v1** — see `STUDIO_FORWARD_PLAN.md`.

---

## Suite identity

| Field | Value |
| --- | --- |
| Visibility | LiNKaios Client (Linktrend tenant v1); Admin support routes optional |
| First proof target | LiNKsuitegen |
| Canonical work unit | Issue |
| Primary controller | Suite Orchestrator LiNKbot |
| Per-product memory | Product Steward LiNKbot |

---

## Module spine (1–10)

| # | Module key | Purpose | Primary executors |
| --- | --- | --- | --- |
| 1 | `module_01_opportunity_intake` | Capture and classify software opportunity | Product Steward, Market LiNKbot, LiNKautowork |
| 2 | `module_02_market_feasibility` | Determine whether opportunity is worth building | Product Steward, Market LiNKbot, Codex, automations |
| 3 | `module_03_product_blueprint` | Build-ready product package and go/no-go | Product Steward, Requirements LiNKbot, human |
| 4 | `module_04_architecture_reuse` | Architecture, stack, starter kit, reuse | Architecture LiNKbot, Codex, human |
| 5 | `module_05_implementation_planning` | Executable Issues and parallel work graph | Orchestrator, Product Steward, Codex |
| 6 | `module_06_development_execution` | Build from approved work packets | Cursor, Codex, LiNKautowork, specialists |
| 7 | `module_07_continuous_validation` | Validate, repair, revalidate | QA LiNKbot, Security LiNKbot, LiNKautowork, Codex |
| 8 | `module_08_release_readiness` | Staging, launch, runbook, rollback | DevOps LiNKbot, Security LiNKbot, human |
| 9 | `module_09_launch_operations` | Live verification and ops transition | Product Steward, LiNKautowork, DevOps |
| 10 | `module_10_continuous_improvement` | Improvements and next product loop | Orchestrator, Product Steward, platform LiNKbot |

Full phase and issue template detail lives in the external manifest (`manifest/linkdeveloper.suite.json`).

---

## Capability connectors

Per declaration manifest:

- `cap.plane.execution_tracking`
- `cap.zulip.run_messaging`
- `cap.linkdeveloper.executor_dispatch`
- `cap.linkdeveloper.validation_run`
- `cap.linkdeveloper.artifact_persist`

---

## LiNKautowork handles (required hooks)

| Handle | Typical use |
| --- | --- |
| `autowork.linkdeveloper.product_run_bootstrap` | Open product run and Module 1 Issues |
| `autowork.linkdeveloper.issue_dispatch` | Route Issue to governed executor |
| `autowork.linkdeveloper.validation_record` | Record validation evidence |
| `autowork.linkdeveloper.artifact_write` | Persist durable artifacts |

---

## LiNKbrain — audit / memory

Minimum domain prefixes: `linkdeveloper.product_run`, `linkdeveloper.issue`, `linkdeveloper.validation`, `linkdeveloper.approval`, `linkdeveloper.executor`.

Product Steward carries per-product episodic memory; orchestrator emits suite-level control events.

---

## LiNKaios Admin surfaces

From `docs/LINKAIOS_ADMIN_INTEGRATION_SPEC.md`:

- Product runs, work graph, artifacts, approvals, executor runs, validation results, release readiness
- Module catalogue read view via `module-catalogue.ts` hook → external JSON manifest

---

## Proof criteria (LD-17)

- Registry entry in `suites/suite-registry.md` with external repo pointer.
- Declaration manifest and module catalogue hook load without importing LiNKdeveloper runtime.
- Admin API and UI wiring deferred to LD-18 and LD-19.

---

## Explicit non-goals (v1)

- General client marketplace listing or tenant self-subscribe outside entitled slugs (`linktrend`).
- Copying LiNKdeveloper services, migrations, or executor adapters into this monorepo.
- Live GitHub push, production deploy, or secrets writes without explicit approval gates.
