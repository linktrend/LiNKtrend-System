# LiNKapps — canonical workflow map (App Factory / `linkapps.app_factory`)

**Module:** `modules/linkapps`  
**Sources:** `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`, `LINKAPPS_CAPABILITY_REQUIREMENTS.md`, `LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`, `modules/linkapps/manifest.yaml`  
**External repo:** `/Users/linktrend/Projects/LiNKapps`

Readable spine for the **7-phase venture lifecycle**, with **Phase 5** broken into substages that match the declaration manifest. Judgment work is LinkBot; deterministic CI/build/deploy steps are LiNKautowork; leases are LinkSkills; narrative memory is LiNKbrain; routing/UI is LiNKaios.

---

## Full lifecycle (phases 1–7) — summary

| Phase | Name | Dominant plane | Purpose | Notes |
| --- | --- | --- | --- | --- |
| 1 | Discovery & Research | LiNKbot (`market_research_bot`) | Market/competitor research bundle | `cap.research.public_web`; provenance |
| 2 | Feasibility & Stress-Test | LiNKbot (`feasibility_bot`) | Feasibility report on blueprint | Governance per conversion plan |
| 3 | Blueprinting | LiNKbot + LiNKaios (`product_owner`, kernel) | Blueprint / PRD readiness | Plane tasks; `blueprint.compile`-class hooks (future precise handle naming per WP-109) |
| 4 | Final Gate | LiNKaios | Human/strategic approval | `approval.gate_check` posture; no autonomous bypass |
| 5 | Technical Implementation | **All planes** | Repo + services + implementation + validation + dev deploy + handoff | Detailed below |
| 6 | Launch & Traction | LiNKbot (`growth_bot`) | GTM scaffolding | **`cap.postiz.distribution`** mock in MVO per manifest |
| 7 | Spinout | LiNKaios + LiNKbrain | Handoff / venture packaging | `spinoff.package` / audit export posture |

MVO default mode is **development** only (`modes_supported` in manifest).

---

## Phase 5 — detailed substages (manifest-aligned)

| Order | Stage ID | Summary | Responsible plane (manifest) | Inputs | Outputs | Failure mode |
| --- | --- | --- | --- | --- | --- | --- |
| 5.1 | `linkapps.phase5.squad_formation` | Squad config + role assignments | LinkBot | `blueprint_ref`, `venture_id`, `squad_task_queue_ref` | `squad_config`, `role_assignments` | abort_run |
| 5.2 | `linkapps.phase5.repo_generation` | Materialize repo from template/starter | LiNKautowork | `blueprint_ref`, `prd_ref`, `squad_config`, `app_slug`, `app_name` | `app_repo_ref`, `git_commit_sha` | retryable |
| 5.3 | `linkapps.phase5.service_provisioning` | Stub/mock Supabase, Stripe, etc. | LiNKautowork | `app_repo_ref`, `tenant_id`, `provisioning_profile_ref` | `service_credentials_ref`, `supabase_project_ref`, `stripe_product_ids_ref` | retryable |
| 5.4 | `linkapps.phase5.ai_implementation` | Squad iterations (FE/BE/mobile specialists) | LinkBot | `app_repo_ref`, `prd_ref`, `squad_config`, `provisioning_profile_ref` | `implementation_bundle_ref`, `built_app_bundle`, `files_changed_manifest_ref` | retryable |
| 5.5 | `linkapps.phase5.quality_validation` | Deterministic tests/checks | LiNKautowork | `app_repo_ref`, `test_matrix_ref`, `lease_ids` | `validation_report_ref`, `checks_passed` | abort_run |
| 5.6 | `linkapps.phase5.deployment` | Dev-mode deploy / preview URLs | LiNKautowork | `app_repo_ref`, `deployment_target_ref`, `lease_ids` | `deployment_refs`, `preview_urls` | retryable |
| 5.7 | `linkapps.phase5.handoff_pack` | Operator docs + handoff bundle | LiNKautowork | `app_repo_ref`, `service_refs`, `deployment_refs` | `handoff_package_ref`, `audit_event_ids` | retryable |

**Orchestration:** LiNKaios kernel is the authoritative orchestrator (`LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`); parallel specialists only when file/domain boundaries do not overlap.

---

## LiNKbot roles (manifest subset)

See `modules/linkapps/manifest.yaml` `required_linkbot_roles` for full contracts. Core Phase 5 actors:

- `technical_lead`, `product_owner`, `frontend_specialist`, `backend_specialist`, `mobile_developer`, `database_architect`, `test_engineer`, `qa_automation_engineer`, `devops_engineer`, `security_auditor`, `documentation_writer`

Lifecycle roles: `market_research_bot`, `feasibility_bot`, `growth_bot`.

Bots MUST NOT issue leases directly where manifest specifies `no_direct_lease_issue`; kernel requests leases.

---

## Capability connectors

Per manifest `required_capabilities`:

- `cap.github.repo_management`
- `cap.supabase.provisioning`
- `cap.stripe.product_management`
- `cap.vercel.deployment`
- `cap.eas.build`
- `cap.plane.execution_tracking`
- `cap.zulip.run_messaging`
- `cap.research.public_web`
- `cap.asset.generation`
- `cap.postiz.distribution`

Mode matrix and lease SKUs: `LINKAPPS_CAPABILITY_REQUIREMENTS.md`.

---

## LiNKautowork handles (required hooks)

Per manifest `required_workflow_hooks`:

| Handle | Typical stage |
| --- | --- |
| `autowork.linkapps.create_repo` | 5.2 |
| `autowork.linkapps.provision_services` | 5.3 |
| `autowork.linkapps.build_iteration` | 5.4 (deterministic loop companion to bot work) |
| `autowork.linkapps.release_readiness` | 5.5 |
| `autowork.linkapps.deploy` | 5.6 |
| `autowork.linkapps.compile_handoff` | 5.7 |

Additional lifecycle handles referenced in conversion plan (exact naming in WP-109): `blueprint.compile`, `approval.gate_check`, `spinoff.package`.

---

## LiNKbrain — audit / memory events

Use manifest `required_audit_events` plus squad narrative objects (`SquadExecution`, `AppBlueprint`, `AppRepo` refs per conversion plan §6.2).

Minimum domain verbs: `linkapps.blueprint.received`, `linkapps.squad.formed`, `linkapps.repo.created`, `linkapps.services.provisioned`, `linkapps.build.iteration`, `linkapps.validation.passed`, `linkapps.deployed`, `linkapps.handoff.ready`, `linkapps.spunoff`.

---

## Plane tasks (shape)

- Venture-level project: `{venture_id} — App Factory`
- Phase 5: per-substage tasks aligned to `stage_id`; readiness probes optional shadow mode.

---

## LiNKaios UI surfaces

From manifest `public_surfaces.ui_panels` / `read_views`:

- `linkapps.factory_dashboard`, `linkapps.blueprint_intake`, `linkapps.squad_monitor`, `linkapps.build_logs`, `linkapps.validation_results`, `linkapps.deployment_history`, `linkapps.spinoff_queue`
- Read views: ventures, squads, templates catalog

---

## Proof criteria

- Declaration manifest stages match this map (IDs and ordering).
- Later implementation waves prove: lease + audit on each connector touch; deterministic workflows completed with recorded `workflow_run_ids`; mock outbound Zulip/Postiz where MVO requires.

---

## Explicit non-goals (MVO)

- Silent live GitHub push, production SaaS provisioning, live Stripe catalog writes, live outbound messaging — require explicit future packets + tenant opt-in per `LINKAPPS_CAPABILITY_REQUIREMENTS.md` §1.
