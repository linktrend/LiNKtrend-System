# Compressed 7-Day vs Conservative 21-Day Plan v2

> **Superseded for MVO bar (May 2026):** Calendar compression does not lower Principal’s MVO. See [`05_MVO_Scope_and_Demo_Flow_v2.md`](./05_MVO_Scope_and_Demo_Flow_v2.md). Use this file for day-by-day wiring sequencing only.

## Planning Philosophy

Use the 21-day plan for engineering realism.

Use the 7-day plan as the execution target.

The architect review found that 7 days is optimistic for the full acceptance criteria, but also found enough existing code that a 7-day compressed sprint may succeed if blockers are stubbed and old code is reused aggressively.

## 7-Day Compression Target

The 7-day target is:

> one working internal demo, not a complete product.

## 21-Day Conservative Target

The 21-day target is:

> a stable internal MVO that can be used to begin real LinkSites operations and start building vertical plugins and skills.

## Day 1 — Decisions, Command Center, Reuse Map

Wire `LiNKdev/` and `LiNKdev/product/grounding/`.

Add architect review report.

Verify repo inventory using architect report as starting map.

Freeze Day-1 decisions.

Create WebsiteFactory plugin manifest.

Create MVO contracts.

## Day 2 — Wire Existing LiNKaios, LiNKbrain, LinkSkills

LiNKaios: confirm 12-route UI boots and create wiring points.

LiNKbrain: port archive migrations or confirm active repo equivalent.

LinkSkills: verify existing logic-engine endpoints and catalog.

Create minimum service health checks.

## Day 3 — Wire LiNKautowork and LiNKbot

LiNKautowork: use existing gateway, add LinkSites workflow templates.

LiNKbot: implement minimal adapter around current `LiNKbot-core`.

Prove LiNKbot can request context, request lease, and trigger workflow.

## Day 4 — LinkSites Template/Preview Path

Use `LiNKsites/apps/cms` and `apps/web-master` or simplest viable template path.

Implement lead → template → generated copy → preview output.

Stub preview publishing if needed.

## Day 5 — CRM/Plane Tracking and Audit

Create real or stub CRM record.

Create real or stub Plane project/tasks.

Ensure all steps emit audit events to LiNKbrain.

Show status in LiNKaios.

## Day 6 — Integration And Dashboard

Wire dashboard views.

Show lead, bot run, capability lease, autowork run, memory events, CRM/Plane status, preview site link.

Fix broken contracts.

## Day 7 — Demo Hardening

Run full demo repeatedly.

Write demo script.

Document known issues.

Create next sprint backlog.

Deploy locally and prepare internal DigitalOcean deployment if time allows.

## Days 8–14 — Stabilization If Needed

Replace stubs with real Plane/CRM integration.

Improve LiNKbot reliability.

Improve LinkSkills policy checks.

Improve LiNKbrain context assembly.

Harden LiNKautowork workflows.

Add tests.

## Days 15–21 — Internal MVO Hardening

Deploy internal version.

Add basic observability.

Add cost caps.

Add kill switch.

Add backup/export.

Add more WebsiteFactory templates/capabilities.

Prepare for real internal use.

## Compression Rule

If a task blocks the 7-day sprint, stub it, log it, and keep the flow moving.

Do not let Plane, CRM, lead source, preview hosting, or perfect OpenClaw integration block the core proof.
