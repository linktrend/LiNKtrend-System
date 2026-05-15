# AGENT COORDINATION

## Global Status

Command center initialized. No implementation work started from this document. Track factual progress in agent reports and work packet status lines.

## Current MVO Target

**LinkSites vertical plugin in development mode on the reusable LiNKtrend platform slice.** The current MVO target is mock CRM lead → LinkBot research/content/site build → local generated artifacts → Supabase mirror → LiNKautowork sync to local Payload CMS → preview-ready frontend → deterministic checks → CRM status `ready_to_contact`. Real lead acquisition, real client outreach, and real VPS deployment are disabled for the MVO.

## Active Agents

| Agent | Report file |
|-------|-------------|
| Architect | `AGENT_REPORTS/architect.md` |
| Repo Archaeologist | `AGENT_REPORTS/repo-archaeologist.md` |
| LiNKaios | `AGENT_REPORTS/linkaios-agent.md` |
| LiNKbrain | `AGENT_REPORTS/linkbrain-agent.md` |
| LinkSkills | `AGENT_REPORTS/linkskills-agent.md` |
| LiNKautowork | `AGENT_REPORTS/linkautowork-agent.md` |
| LinkBot | `AGENT_REPORTS/linkbot-agent.md` |
| Integration | `AGENT_REPORTS/integration-agent.md` |

## Current Work Packets

| ID | File | Intent |
|----|------|--------|
| WP-000 | `WORK_PACKETS/WP-000-command-center-and-docs-verification.md` | Verify command center + ecosystem docs |
| WP-001 | `WORK_PACKETS/WP-001-repo-inventory-and-reuse-map.md` | Inventory repo and reuse map [completed] |
| WP-002 | `WORK_PACKETS/WP-002-day-1-decision-freeze.md` | Freeze Day-1 decisions / stubs |
| WP-003 | `WORK_PACKETS/WP-003-websitefactory-plugin-manifest.md` | LiNKaios kernel/plugin manifest using WebsiteFactory |
| WP-004 | `WORK_PACKETS/WP-004-mvo-contracts.md` | MVO cross-service contracts bound to WP-003 [completed] |
| WP-005 | `WORK_PACKETS/WP-005-linklogic-sdk-types.md` | Shared LinkLogic SDK contract types [completed] |
| WP-006 | `WORK_PACKETS/WP-006-linkbrain-audit-envelope.md` | LiNKbrain audit envelope + writer [completed] |
| WP-007 | `WORK_PACKETS/WP-007-linkskills-lease-lifecycle.md` | LinkSkills lease lifecycle [completed; WP-012 reconciles overlap] |
| WP-008 | `WORK_PACKETS/WP-008-linkautowork-websitefactory-workflows.md` | LiNKautowork WebsiteFactory workflows [completed with fix pass] |
| WP-009 | `WORK_PACKETS/WP-009-linkbot-reasoning-dispatch.md` | LinkBot reasoning dispatch [completed with boundary fixes] |
| WP-010 | `WORK_PACKETS/WP-010-linkaios-kernel-orchestration.md` | LiNKaios kernel orchestration [completed] |
| WP-011 | `WORK_PACKETS/WP-011-websitefactory-plugin-glue.md` | WebsiteFactory plugin declaration + glue [completed] |
| WP-012 | `WORK_PACKETS/WP-012-mvo-stub-backends.md` | CRM/Plane/preview stub backends [completed] |
| WP-013 | `WORK_PACKETS/WP-013-e2e-demo-and-audit-harness.md` | End-to-end demo + audit assertions [completed with proof correction] |
| WP-014 | `WORK_PACKETS/WP-014-database-runtime-preflight.md` | Database runtime preflight to unblock WP-013 [completed; migrations/runtime unblocked] |
| WP-040 | `WORK_PACKETS/WP-040-plugin-architecture-contract-v2.md` | Shared vertical/capability plugin architecture contract v2 |
| WP-041 | `WORK_PACKETS/WP-041-linksites-vertical-contract-v2.md` | LinkSites vertical MVO v2 contract |
| WP-042 | `WORK_PACKETS/WP-042-linksites-template-payload-discovery.md` | Discover existing LinkSites master template, Payload model, Supabase mirror, and preview frontend |
| WP-043 | `WORK_PACKETS/WP-043-capability-plugin-contract-pack-v1.md` | Capability plugin contract pack for Odoo/CRM, Payload, Supabase mirror, Zulip, web research, asset generation, Plane |
| WP-044 | `WORK_PACKETS/WP-044-linkbot-role-contract-pack-v1.md` | LinkSites LinkBot role contract pack |
| WP-045 | `WORK_PACKETS/WP-045-linkautowork-linksites-workflow-contract.md` | LiNKautowork deterministic workflow contract for LinkSites v2 |

## Day-1 Decisions To Freeze

**Frozen as of 2026-05-14 (WP-002).** All eight Day-1 rows in `DECISIONS.md` are resolved as **Accepted** or **Stubbed**. No remaining Pending rows. No items deferred without an owner.

- D-01 CRM → **Stubbed** (integration-agent) — local CRM tables; see `INTEGRATION_QUEUE.md` INT-020.
- D-02 Plane → **Stubbed** (integration-agent) — local project/task tables; see INT-021.
- D-03 Preview publishing → **Accepted** static/local via `web-master` (linkaios-agent); see INT-022.
- D-04 OpenClaw source → **Accepted** `LiNKbot-core` (linkbot-agent).
- D-05 Supabase mode → **Accepted** remote Supabase (database-architect).
- D-06 Model routing → **Accepted** OpenRouter (linkaios-agent).
- D-07 Website template → **Accepted** `LiNKsites/apps/web-master` (linkaios-agent).
- D-08 Audit event contract → **Accepted** standardized envelope to LiNKbrain (linkbrain-agent); schema finalized in WP-004.

## Repo Map

Populated from `REPO_INVENTORY.md`.

- **LiNKaios:** `LiNKtrend-System/apps/linkaios-web` (UI), `packages/linklogic-sdk` (SDK).
- **LiNKbrain:** `Archive/LiNKaios/packages/linkbrain/migrations` (schema reference).
- **LinkSkills:** `LiNKskills/services/logic-engine` (engine), `LiNKskills/skills/` (catalog).
- **LiNKautowork:** `LiNKautowork/gateway/` (n8n integration).
- **LinkBot:** `LiNKbot-core` (runtime), `LiNKtrend-System/apps/bot-runtime` (adapter).
- **WebsiteFactory:** `LiNKsites/apps/web-master` (template), `LiNKsites/apps/cms` (Payload).
- **UI:** `LiNKapps/packages/ui` (shadcn).

## Decisions Made

- *WP-001 evidence suggests `LiNKsites/apps/web-master` as the primary MVO template source.*
- *WP-001 evidence suggests `LiNKbot-core` as the primary LinkBot runtime source.*
- 2026-05-14 (WP-002) — `DECISIONS.md` D-01 through D-08 frozen. See **Day-1 Decisions To Freeze** above.

## Open Questions

- *(Day-1 forks resolved by WP-002. Reopen here only if a downstream packet reveals a frozen decision is unworkable.)*

## Parallel Launch Plan

Wave 1:

- Start `WP-005` with Architect / Integrator.
- Start `WP-006` with LinkBrain + Database Architect.

Wave 2, after WP-005 types are available:

- Start `WP-007` LinkSkills lease lifecycle.
- Start `WP-008` LiNKautowork workflows.
- Start `WP-009` LinkBot reasoning dispatch.

Wave 3, after WP-005 + WP-006 and with WP-007 sufficiently stable:

- Start `WP-010` LiNKaios kernel orchestration, including LiNKbrain audit RPC preflight/wrapper if required.
- Start `WP-012` stub backends, coordinating with WP-007.

Wave 4:

- Start `WP-011` WebsiteFactory plugin glue after WP-010.
- Start `WP-013` E2E/demo harness last.

## Blockers

- None for WP-020..WP-022 after integrator audit-ref aggregation fix and fresh E2E proof.

## Integration Queue

Canonical list: `INTEGRATION_QUEUE.md`.

## Operator Runbook

- WebsiteFactory MVO demo/operator handoff: `DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md` (WP-018)

## Merge Queue

Canonical list: `MERGE_QUEUE.md`.

## Latest Updates

- 2026-05-15 — Revised MVO direction approved. Current target is LinkSites vertical plugin development-mode workflow, not deployment: mock CRM lead, LinkBot research/content/site build, local generated artifacts, Supabase mirror, local Payload CMS sync, preview-ready site, deterministic checks, and CRM `ready_to_contact`. Real lead acquisition, real outreach, and real VPS deployment are disabled. Added source docs `PLUGIN_ARCHITECTURE_V2.md` and `LINKSITES_VERTICAL_MVO_V2.md`, plus WP-040..WP-045 packets.
- 2026-05-15 — WP-031..WP-034 verification completed by Integrator. Fixed duplicate CRM entries in `.env.example` and normalized DigitalOcean scaffold failure mapping to canonical `INTEGRATION_*` codes. Focused verification passed: `pnpm --filter @linktrend/linklogic-sdk test -- contracts-mvo` (11 files, 74 tests) and `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/api-auth.test.ts src/lib/kernel/kernel.test.ts src/lib/kernel/dispatch.test.ts src/lib/kernel/plane-adapter.test.ts` (5 files, 74 tests). Fresh E2E passed with run `6f7e0389-886e-4c27-b61d-6cbb5fd53269`; `preview_url` is now absolute and required audit counts are verified.
- 2026-05-15 — WP-028..WP-030 discovery conclusions reviewed. WP-028 recommends Chatwoot-first shadow/readiness mode with stub writes retained. WP-029 recommends Plane real path behind explicit mode with external-id mapping before remote writes. WP-030 was corrected to DigitalOcean-first hosted preview discovery while keeping static/local preview active for one more milestone. Next wave should implement provider-agnostic contracts/config first, then shadow/readiness adapters with no external writes by default.
- 2026-05-15 — User confirmed hosted preview/deployment target is DigitalOcean, not Vercel. Integrator corrected planning source-of-truth: D-03, INT-022/INT-033, repo inventory, and WP-017 now frame post-MVO hosted preview/publish around DigitalOcean plus Payload/LinkSites while preserving the MVO static/local fallback. Prior Vercel-specific roadmap language is superseded.
- 2026-05-15 — WP-024 security review initially found SEC-001: same-tenant users could cross-access sibling runs/approvals via tenant-history fallback. Integrator patched `canAccessKernelScope()` so run/approval scopes require direct ownership unless service/operator-allowlisted, filtered ordinary-user approval listing, and added regression tests. Verification passed: `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/api-auth.test.ts src/lib/kernel/kernel.test.ts` (3 files, 70 tests) and fresh E2E run `63d6e532-4aaa-40da-952c-25d83fb244b9` passed.
- 2026-05-15 — WP-023 final integration review completed with fresh run `9af1216f-4719-4191-94ef-fdf2b8b699f8` passing `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true pnpm test:mvo:e2e`. Merge queue remains ready with no active WP-020..WP-022 blockers.
- 2026-05-15 — Integrator closed the WP-022 audit aggregation blocker. `executeLinkSkillsLease()` now returns all output-level audit refs, `executeStage()` persists multiple audit refs per stage through `linkaios_kernel.add_stage_refs`, and fresh run `260f42aa-b2cc-415e-b89a-a0d619b8de85` passed `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS=true pnpm test:mvo:e2e`. Verified required preview-output audit counts: `run.started`, `crm.upserted`, `plane.project.created`, `plane.task.created`, `preview.published`, and `run.completed` all x1. Focused verification also passed: `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/api-auth.test.ts src/lib/kernel/kernel.test.ts` (3 files, 68 tests).
- 2026-05-15 — WP-022 fresh post-hardening MVO E2E reproof rerun completed with fresh run `80b889b6-c62d-4fe2-a8db-61970077e32d` (distinct from `119d7a1c-f3bf-4621-80a9-083291fe293d`). `preview_output.status` is `succeeded`, `preview_artifact_ref` is populated, and `lease_ids`/`workflow_run_ids` are non-empty. This run exposed a missing `plane.project.created` ref in `preview_output.audit_event_ids`; this blocker was later closed by the integrator fix and passing rerun `260f42aa-b2cc-415e-b89a-a0d619b8de85` noted above.
- 2026-05-15 — Integrator review of completed WP-015..WP-019 found merge/sign-off blockers. Focused unit verification passed after auth hardening, but final E2E proof must be rerun. Before merge: add tenant/run/approval authorization checks for kernel APIs, prove/patch output-level audit events and `PreviewOutput.audit_event_ids`, and rerun `pnpm test:mvo:e2e` successfully on a fresh run.
- 2026-05-15 — WP-015..WP-019 post-MVO wave reviewed by Integrator. Follow-up fixes applied: kernel work-request route now derives `requested_by` from resolved actor instead of request body, middleware service pass-through requires `LINKAIOS_ENABLE_MVO_SERVICE_BYPASS`, `.env.example` documents kernel auth flags, and demo runbook uses `pnpm test:mvo:e2e`. Verification: `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/api-auth.test.ts src/lib/kernel/kernel.test.ts` passed (3 files, 62 tests). Note: future post-MVO work packet files use `WP-015`..`WP-019` numbering for integration cutovers, while stabilization notes in the report also used WP-015..WP-018 labels; avoid reusing those labels in future prompts without filename context.
- 2026-05-15 — WP-013 final proof correction completed by Codex and reviewed by Integrator. Run `119d7a1c-f3bf-4621-80a9-083291fe293d` has verified non-empty `lease_ids`, `workflow_run_ids`, `audit_event_ids`, populated `preview_artifact_ref`, and final `succeeded` status against the real database runtime. Patch reviewed: `getRunTrace()` now assigns `run.stages = stages` before preview-output aggregation. Verification: `pnpm --filter @linktrend/linkaios-web test -- src/lib/kernel/kernel.test.ts` passed (2 files, 55 tests).
- 2026-05-15 — Antigravity reported WP-013 completed with run `119d7a1c-f3bf-4621-80a9-083291fe293d`, preview URL, approval flow, CRM/project/task refs, and schema-aware runtime fixes. Integrator review found a proof gap: final trace snapshot shows empty `lease_ids`, `workflow_run_ids`, and `audit_event_ids`, which conflicts with WP-013 acceptance criteria and `CONTRACTS_MVO.md` §§8-10. Do a final proof/fix pass before marking MVO E2E complete.
- 2026-05-14 — WP-014 rerun after exposing `linkaios_kernel` showed `test_brain_rpc_path()` now resolves but both paths fail with ambiguous `event_id`. Integrator patched `023_linkbrain_audit_envelope.sql` to use `ON CONFLICT ON CONSTRAINT audit_events_pkey`. Also corrected stale preflight/report wording from `write_audit_event_safe` to deployed wrapper `write_brain_audit_event`. Next: rerun migrations and `test_brain_rpc_path()`.
- 2026-05-14 — WP-014 rerun reached `027_preview_artifact_storage.sql` and failed with PostgreSQL `42P13`. Integrator patched `linkaios.upsert_preview_artifact()` by removing the early default on `p_plugin_id`. Supabase REST preflight also confirmed `linkaios_kernel` is not exposed (`PGRST106`); exposed schemas are currently `public`, `graphql_public`, `linkaios`, `prism`, `bot_runtime`, and `gateway`. Next: rerun migrations, then expose required internal schemas or add exposed wrappers before WP-013.
- 2026-05-14 — WP-014 rerun moved past host connectivity: Supabase pooler is reachable. Integrator patched a SQL typo in `025_linkaios_kernel_orchestration.sql` (`add_run_refs()` stray token) and corrected the audit RPC preflight guidance to call `test_brain_rpc_path()` through the `linkaios_kernel` schema rather than `public`. Next: rerun `pnpm db:migrate`, then schema-aware audit RPC preflight, then WP-013 if both pass.
- 2026-05-14 — WP-014 completed root-cause diagnosis but did not fully unblock WP-013. Remote REST host resolves, but expected MVO schemas/RPCs are missing; direct DB host fails DNS; Docker/local Postgres is unavailable. Next action is infrastructure: correct `.env` to one matching Supabase project and use the Supabase Session Pooler connection string, then rerun `pnpm db:migrate` and the audit RPC preflight before WP-013.
- 2026-05-14 — WP-013 Antigravity run blocked before application execution: `pnpm db:migrate` cannot resolve configured Supabase host `db.ilxzgfyllipkwrgrviof.supabase.co`, and Docker is not running for local Supabase. Added WP-014 database runtime preflight. Do not use an in-memory SQL mock for final MVO proof; first establish a real remote or local Supabase/Postgres path, then rerun WP-013.
- 2026-05-14 — WP-011 follow-up reviewed. Kernel now imports and delegates non-kernel WebsiteFactory stages through `executeWebsiteFactoryStage()` from the plugin module. WP-013 is unblocked and running in Antigravity.
- 2026-05-14 — WP-011 review found one blocker before WP-013: WebsiteFactory plugin exists with tests, but kernel execution still uses hardcoded mappings in `apps/linkaios-web/src/lib/kernel/orchestrator.ts`. Need a small integration fix so `websitefactory.lead_to_preview` loads/executes through plugin extension points.
- 2026-05-14 — WP-010/WP-012 follow-ups reviewed. Migration numbering is clean (`025_linkaios_kernel_orchestration.sql`, `026_linkbrain_rpc_wrapper.sql`, `027_preview_artifact_storage.sql`). Integrator patched `test_brain_rpc_path()` to use canonical `run.started`, deterministic UUIDs, cleanup, and non-recursive diagnosis. WP-011 may launch.
- 2026-05-14 — WP-010/WP-012 review found blockers before WP-011: duplicate `025_*` migration numbering and WP-010 audit RPC preflight writing non-canonical `test.event`. Fix these before launching WP-011.
- 2026-05-14 — WP-008 fix pass and WP-009 boundary fixes reviewed. WP-008 now preserves cached `workflow_run_id`, returns failure audit IDs, and includes `preview_artifact_ref` in `preview_serve` output. WP-009 now exposes a `ModelCallAdapter`, documents the MVO env fallback boundary, and surfaces audit-write failure as `KERNEL_PERSISTENCE_FAILED`. Wave 3 may start: WP-010 and revised WP-012, with no shared-file edits.
- 2026-05-14 — WP-007/WP-008/WP-009 review completed. Do not launch WP-010/WP-012 yet. Required follow-ups: WP-008 contract fix pass; WP-009 model-secret/audit semantics review; WP-012 scope must reconcile WP-007 stub tables instead of duplicating them.
- 2026-05-14 — WP-005 and WP-006 completed. WP-005 pinned shared MVO Zod schemas/types in `packages/linklogic-sdk` with tests/typecheck passing. WP-006 added `linkbrain.audit_events`, `linkbrain.write_audit_event`, and SDK audit writer/validator with tests/typecheck passing. Operational note for downstream agents: confirm Supabase/PostgREST exposes the `linkbrain` RPC schema or add a wrapper before integrated runtime testing. Wave 2 may start: WP-007, WP-008, WP-009.
- 2026-05-14 — Post-WP-004 implementation packets authored: WP-005 through WP-013. `CONTRACTS_MVO.md` received a small consistency patch clarifying that LiNKaios emits terminal run events while LiNKbrain persists closure refs, and adding `preview_artifact_ref` to the audit subject. First launch wave: WP-005 + WP-006.
- 2026-05-14 — WP-004 completed by Architect. `.ai-swarm/CONTRACTS_MVO.md` rewritten end-to-end: typed `PluginManifest` + WebsiteFactory binding (§1), canonical data dictionary (§2), `LeadInput` + idempotency + PII rules (§3), `WorkRequest`/`Run`/`Stage` lifecycle + retry (§4), `FailureReport` taxonomy with canonical error enum (§5), cross-plane envelopes for LinkBot reasoning / LinkSkills lease lifecycle / LiNKbrain audit (D-08) / LiNKautowork workflow lifecycle (§6), capability contracts for `crm.upsert`/`plane.project.create`/`plane.task.create`/`preview.publish` (§7), minimum audit-event sets for succeeded/failed/awaiting_approval runs (§8), `PreviewOutput` (§9), end-to-end stage trace (§10), STUB blocks for INT-020/INT-021/INT-022 (§11), role-bleed rules per plane + per plugin (§12), and recommended parallel packets WP-005..WP-013 (§13). No `TBD` placeholders remain. `DECISIONS.md` and `INTEGRATION_QUEUE.md` unchanged — no new fork or integration uncovered. Next active packets: author WP-005 (linklogic-sdk types) and WP-006 (LiNKbrain audit envelope) before unblocking the parallel implementation wave.
- 2026-05-14 — WP-003 completed by LiNKaios agent. Kernel + plugin manifest captured in `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md` (kernel responsibilities + non-ownership, WebsiteFactory manifest with stages/capabilities/workflow hooks/audit events/preview output, plane ownership map, ≥3 integration points cross-referenced to `INTEGRATION_QUEUE.md`, non-goals, WP-004 handoff list). Original WP-003 file wording retained for traceability; corrected interpretation recorded in the manifest §0 and in `AGENT_REPORTS/linkaios-agent.md`. Next active packet: WP-004 MVO contracts.
- 2026-05-14 — WP-003/WP-004 framing corrected: LiNKtrend-System is the LiNKaios control-plane repo; WebsiteFactory is the first vertical plugin example, not the core product.
- 2026-05-14 — WP-002 completed by Architect. `DECISIONS.md` frozen (D-01..D-08), `INTEGRATION_QUEUE.md` populated with INT-010..INT-022 and deferred items INT-030..INT-034. Next active packet: WP-003 WebsiteFactory plugin manifest.
- 2026-05-14 — WP-001 completed by Repo Archaeologist. `REPO_INVENTORY.md` populated. Next active packet: WP-002 Day-1 decision freeze.
- 2026-05-14 — ChatGPT handover completed. Cursor Architect is now primary execution orchestrator.
