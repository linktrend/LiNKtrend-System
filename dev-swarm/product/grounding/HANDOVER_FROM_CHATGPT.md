# HANDOVER FROM CHATGPT TO CURSOR ARCHITECT

## 1. Handover Purpose

This file formally transfers day-to-day execution orchestration from the ChatGPT planning conversation to the Cursor Architect / Integrator agent working inside the LiNKtrend-System repo.

From this point forward, the repo files under `dev-swarm/product/grounding/` are the operational source of truth.

ChatGPT should no longer be treated as the live coordinator. ChatGPT may still be used later for second opinions, plan correction, architecture review, or prompt repair, but the Cursor Architect / Integrator now owns execution coordination.

## 2. Current Project Context

The project is the LiNKtrend AI Agent Ecosystem.

The ecosystem consists of:

- LiNKaios — organizational execution control plane
- LiNKbrain — institutional memory and learning plane
- LinkSkills — capability governance and capability lease plane
- LiNKautowork — deterministic workflow execution plane
- LiNKbot — role-bound AI employee runtime adapter

The current repo being used as the coordination repo is:

`/Users/linktrend/Projects/LiNKtrend-System`

The stable ecosystem design docs are under:

`docs/ecosystem/design/`

The stable development plan docs are under:

`docs/ecosystem/development-plan/`

The active execution command center is:

`dev-swarm/product/grounding/`

## 3. Current Build Objective

The immediate target is an internal MVO.

The MVO is the LinkSites / WebsiteFactory lead-to-preview-site flow.

The flow is:

1. A LiNKbot finds or selects an SMB lead.
2. The LiNKbot evaluates the lead.
3. The LiNKbot selects an industry website template.
4. The LiNKbot generates business-specific copy.
5. The LiNKbot selects or places suitable images/placeholders.
6. The LiNKbot changes look-and-feel without changing template structure.
7. LiNKautowork executes deterministic workflow steps.
8. LinkSkills authorizes capabilities through short-lived capability leases.
9. LiNKbrain records events, memory, audit, and trace.
10. CRM and Plane records are created, or MVO-compatible stubs are used if real integration blocks progress.
11. LiNKaios displays status, trace, memory events, skill runs, workflow runs, and preview-site link.

The goal is not to finish the entire ecosystem. The goal is to prove the operating loop.

## 4. Execution Philosophy

Plan conservatively as 21 days.

Execute aggressively toward a 7-day compressed sprint.

The architect review concluded that the seven-day target is optimistic but possible only if the work is treated as:

> wire existing code, do not rebuild from scratch.

Confirmed existing assets should anchor the implementation:

- `LiNKtrend-System` is the LiNKaios monorepo.
- `LiNKskills` already contains substantial Phase 0–3 logic-engine work.
- `LiNKautowork` already contains a substantial n8n gateway MVO.
- `Archive/LiNKaios/packages/linkbrain` contains useful LiNKbrain SQL migrations and schemas.
- `LiNKsites` contains the Payload CMS website factory and `web-master` template.
- `LiNKapps` contains reusable UI/design-system patterns.
- `LiNKbot-core` contains the OpenClaw-based runtime fork.
- `LiNKtrend-LEXOS` should remain separate for now and be used later as a LawFirm/Litigation vertical reference.

If a dependency blocks the 7-day sprint, stub it, document the stub, and continue.

## 5. Non-Negotiable Architecture Boundaries

LiNKaios is the organizational execution control plane.

LiNKbrain is the institutional memory and learning plane.

LinkSkills is the capability governance and capability lease plane.

LiNKautowork is the deterministic workflow execution plane.

LiNKbot is the role-bound AI employee runtime adapter.

LiNKaios coordinates the ecosystem but must not absorb the responsibilities of the other services.

LiNKbot must remain a thin reasoning/runtime shell. It must not own canonical memory, skills, secrets, or deterministic workflow execution.

LinkSkills governs capabilities and side effects. It does not own long-term memory.

LiNKbrain records events, memory, audit, trace, and learning. It does not execute business actions.

LiNKautowork executes deterministic workflows. It does not make high-judgment decisions.

Do not start LEXOS/legal work until the WebsiteFactory MVO works.

## 6. Immediate Next Work

The command center has already been created.

Next work should proceed in this order:

1. WP-001 — repo inventory and reuse map
2. WP-002 — Day-1 decision freeze
3. WP-003 — WebsiteFactory plugin manifest
4. WP-004 — MVO contracts

Do not start broad implementation until WP-001 through WP-004 are complete or explicitly marked sufficient for implementation.

## 7. Day-1 Decisions To Freeze

The Cursor Architect must resolve or recommend defaults for:

- CRM: real Chatwoot/Odoo vs local CRM stub
- Plane: real Plane integration vs local project/task stub
- Preview publishing: LinkSites/Payload vs static/local preview vs Vercel
- OpenClaw source: current LiNKbot-core vs archived LiNKopenclaw vs upstream sync
- Supabase mode: remote Supabase vs local Postgres
- Model routing: OpenRouter vs LiteLLM
- Website template source: LiNKsites apps/web-master unless repo scan finds better
- Audit event contract: all services emit standardized audit events to LiNKbrain

Record decisions in:

`dev-swarm/product/grounding/DECISIONS.md`

## 8. Agent Coordination Rules

Every agent must:

- read `dev-swarm/product/grounding/ARCHITECTURE_RULES.md`
- read `dev-swarm/product/grounding/MASTER_PLAN.md`
- read `dev-swarm/product/grounding/CONTRACTS_MVO.md` if it exists
- read `dev-swarm/product/grounding/REPO_INVENTORY.md` if relevant
- read its assigned work packet
- update its report in `dev-swarm/product/reports/archive/legacy-ai-swarm/`
- produce proof before claiming completion
- stay within assigned scope
- avoid broad rewrites
- avoid adding dependencies without justification
- record significant decisions in `dev-swarm/product/grounding/DECISIONS.md`

Specialist agents do not merge their own work.

The Architect / Integrator owns review and merge readiness.

## 9. Required Proof Standard

A work packet is not complete unless it provides proof.

Acceptable proof includes:

- files created or modified
- commands run
- tests passing
- service boots
- migration applies
- endpoint responds
- UI renders
- curl command result
- demo step completed
- clear explanation of any stub used

## 10. Model And Tool Guidance

Use Gemini 3 Flash, Gemini Pro, or Kimi K2.5 for repo discovery, summaries, and low-cost long-context analysis.

Use Codex App for implementation work in isolated branches/worktrees.

Use Cursor Architect / Opus / GPT-5.5 only for architecture decisions, integration review, difficult debugging, and contract conflicts.

Use Antigravity for UI/browser/testing-heavy tasks.

Use `dev-swarm/product/grounding/` files as project memory. Do not rely on chat memory.

## 11. Escalation Rules

Escalate to Carlos only when:

- a Day-1 decision cannot be made from repo evidence
- a serious architectural conflict exists
- an integration is blocked and requires a product decision
- a paid service/API key is required
- old code conflicts with the agreed architecture
- a timeline-critical scope cut is needed

Do not escalate minor implementation choices.

Make sensible defaults, record them, and continue.

## 12. Current Status At Handover

The `dev-swarm/product/grounding/` command center has been created.

Created folders:

- `dev-swarm/product/grounding/`
- `dev-swarm/product/programs/linktrend-system/issues/legacy/`
- `dev-swarm/product/reports/archive/legacy-ai-swarm/`

Created root files:

- `MASTER_PLAN.md`
- `ARCHITECTURE_RULES.md`
- `AGENT_COORDINATION.md`
- `REPO_INVENTORY.md`
- `CONTRACTS_MVO.md`
- `DECISIONS.md`
- `INTEGRATION_QUEUE.md`
- `MERGE_QUEUE.md`

Created agent reports:

- `architect.md`
- `repo-archaeologist.md`
- `linkaios-agent.md`
- `linkbrain-agent.md`
- `linkskills-agent.md`
- `linkautowork-agent.md`
- `linkbot-agent.md`
- `integration-agent.md`

Created work packets:

- `WP-000-command-center-and-docs-verification.md`
- `WP-001-repo-inventory-and-reuse-map.md`
- `WP-002-day-1-decision-freeze.md`
- `WP-003-websitefactory-plugin-manifest.md`
- `WP-004-mvo-contracts.md`

No application code has been changed yet.

## 13. Instruction To Cursor Architect

From this point forward, act as the main execution orchestrator.

Keep the build focused on the WebsiteFactory lead-to-preview-site MVO.

Keep `dev-swarm/product/grounding/` files current.

Prefer concrete work packets over abstract discussion.

Prefer wiring existing code over rebuilding.

Stub blockers that threaten the 7-day execution target.

After this handover file is created, update:

`dev-swarm/product/grounding/AGENT_COORDINATION.md`

with a note that ChatGPT handover is complete and the next active packet is WP-001.

Then stop and report:

- handover file created
- coordination file updated
- recommended next agent/model for WP-001
