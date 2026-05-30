# Work Packets v2

> **Terminology:** Legacy *work packets* (WP-###) are now **Issues** under `dev-swarm/product/programs/linktrend-system/issues/`. Historical WP files live under `dev-swarm/product/programs/linktrend-system/issues/legacy/` and `dev-swarm/archive/`.

## WP-000 — Command Center And Architect Review Import

Wire `dev-swarm/`, add the architect review report to `dev-swarm/product/grounding/`, create status/report files under `dev-swarm/product/reports/`, and initialize coordination.

Output: `dev-swarm/` factory tree and populated `dev-swarm/product/grounding/`.

## WP-001 — Verified Repo Inventory

Use the architect report as starting point. Verify active and archived repos. Confirm actual paths, reusable components, and current run commands.

Output: `REPO_INVENTORY.md`.

## WP-002 — Day-1 Decision Freeze

Freeze CRM, Plane, preview publishing, OpenClaw source, Supabase mode, model routing, and WebsiteFactory template source.

Output: `DECISIONS.md`.

## WP-003 — WebsiteFactory Plugin Manifest

Create the first vertical plugin manifest.

Must define roles, workflows, skill bindings, required capabilities, memory scopes, automation bindings, UI routes, and MVO data objects.

Output: plugin manifest inside LiNKaios monorepo.

## WP-004 — MVO Contracts

Define Tenant, Role, LiNKbot, Plugin, Capability, CapabilityLease, WorkflowRun, AuditEvent, MemoryEvent, ContextBundle, Lead, WebsitePreview, CRMRecord, PlaneProject.

Output: `CONTRACTS_MVO.md` and types/schemas if practical.

## WP-005 — LiNKaios Kernel Wiring

Use existing 12-route UI. Wire `/workers`, `/work`, `/projects`, `/skills`, `/memory`, `/traces` to MVO endpoints or stubs.

Output: LiNKaios can display MVO status.

## WP-006 — LiNKbrain MVO From Archive

Port or reuse archive LiNKbrain migrations. Build minimal HTTP endpoints: event write, audit run write, context assemble stub, memory candidate write, trace read.

Output: LiNKbrain service can receive audit/events.

## WP-007 — LinkSkills MVO From Existing Logic-Engine

Wire existing `LiNKskills/services/logic-engine` to MVO contracts. Add LinkSites capabilities. Confirm/implement disclosure issue and run endpoints.

Output: LinkSkills can issue capability leases and record runs.

## WP-008 — LiNKautowork MVO From Existing Gateway

Use existing gateway. Add LinkSites workflow templates: lead intake, preview publish, CRM/Plane create/update.

Output: LiNKautowork can execute at least one deterministic workflow and report audit.

## WP-009 — LiNKbot OpenClaw Adapter

Use current `LiNKbot-core` unless Day-1 comparison says otherwise. Create Website Scout/Studio Manager bot. Implement context request, capability lease request, workflow trigger, event emission.

Output: LiNKbot can execute the MVO mission path.

## WP-010 — LinkSites Template/Preview

Use `LiNKsites/apps/cms` and `apps/web-master` if viable. Build the simplest lead-to-template-to-preview path.

Output: preview site URL or local preview artifact.

## WP-011 — CRM/Plane Tracking

Use real Chatwoot/Plane if ready; otherwise use MVO local tables. The demo must show CRM and Plane-equivalent tracking.

Output: lead record and project/tasks.

## WP-012 — Unified Trace

Ensure all services emit audit events into LiNKbrain. LiNKaios trace view reads and displays them.

Output: one trace for the full flow.

## WP-013 — Integration Demo

Run full flow. Fix integration gaps. Write `DEMO_SCRIPT.md`.

Output: repeatable internal demo.

## WP-014 — Post-Demo Hardening Backlog

Create `NEXT_SPRINT_BACKLOG.md` sorted by blocker, risk, and commercial value.

Output: next sprint plan.
