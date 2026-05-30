# LiNKtrend AI Agent Ecosystem — Development Plan v2

## Purpose

This v2 development-plan document set replaces the earlier development-plan package. The change is based on the architect review report produced after inspecting the design documents, the development plan, active repos under `/Users/linktrend/Projects`, and archived repos under `/Users/linktrend/Projects/Archive`.

The key correction is simple:

The project should be **planned as a 21-day conservative engineering plan**, but **executed as a 7-day compression sprint** using aggressive reuse, parallel agents, and daily integration checkpoints.

The previous version treated several items as if they needed to be created from scratch. The architect review confirmed that substantial code already exists and should be wired, refactored, or reused:

- `LiNKtrend-System` already contains the LiNKaios monorepo and 12-route kernel web UI.
- `LiNKskills` already contains a substantial Phase 0–3 logic-engine implementation.
- `LiNKautowork` already contains a substantial n8n gateway MVO.
- Archive `LiNKaios/packages/linkbrain` contains useful LiNKbrain SQL migrations and schemas.
- `LiNKsites` already contains the Payload CMS website factory and `web-master` template.
- `LiNKapps` contains the reusable UI/design system ancestor.
- `LiNKbot-core` contains the OpenClaw-based runtime fork.
- `LiNKtrend-LEXOS` should remain separate for now and be used as a later LawFirm vertical reference.

## Development Posture

The plan is no longer “build skeletons.”

The plan is:

> **Inventory, freeze decisions, wire existing code, stub blockers, prove one end-to-end flow, then harden.**

The first MVO remains the **LinkSites / WebsiteFactory lead-to-preview-site flow**.

## Target Flow

The first working demo should show:

A LiNKbot finds or selects a lead, chooses an industry template, generates copy, adjusts style/look-and-feel without changing structure, publishes a preview site, creates CRM and Plane records or accepted MVO stubs, requests capability leases from LinkSkills, triggers deterministic work through LiNKautowork, writes events/memory to LiNKbrain, and shows trace/status in LiNKaios.

## Critical Day-1 Decisions

Day 1 must freeze decisions that the prior plan deferred too long:

1. CRM: Chatwoot, Odoo CRM, or local CRM table for MVO.
2. Plane: real Plane API integration or local task/project stub for MVO.
3. Preview publishing: LinkSites/Payload, static preview, Vercel preview, or local preview.
4. OpenClaw source: current `LiNKbot-core`, archive `LiNKopenclaw`, or upstream sync.
5. Supabase: remote Supabase or local Postgres for the first integration.
6. WebsiteFactory plugin manifest: roles, workflows, capabilities, memory scopes, and automation bindings.
7. Model routing: OpenRouter first unless an existing LiteLLM setup is already working.
8. Audit union: every service must emit standardized audit events into LiNKbrain.

## Document Index

1. `01_Development_Method_v2.md`
2. `02_Tool_and_Model_Strategy_v2.md`
3. `03_Swarm_Coordination_Model_v2.md`
4. `04_Repo_Strategy_and_Reuse_Map_v2.md`
5. `05_MVO_Scope_and_Demo_Flow_v2.md`
6. `06_Compressed_7_Day_vs_Conservative_21_Day_Plan_v2.md`
7. `07_Work_Packets_v2.md`
8. `08_Branching_Worktree_and_Integration_v2.md`
9. `09_Cost_Control_and_Model_Allocation_v2.md`
10. `10_Agent_Operating_Rules_v2.md`
11. `11_Deployment_Target_v2.md`
12. `12_Risks_Decisions_and_Stubs_v2.md`

## First Three Steps

First, ensure `dev-swarm/` is wired in the LiNKaios monorepo (factory coordination plus `dev-swarm/product/grounding/` plans and contracts).

Second, run repo archaeology, but not as an open-ended discovery exercise. Use the architect review report as a starting map and verify the confirmed repos.

Third, freeze MVO decisions and create the WebsiteFactory plugin manifest before any service implementation starts.
