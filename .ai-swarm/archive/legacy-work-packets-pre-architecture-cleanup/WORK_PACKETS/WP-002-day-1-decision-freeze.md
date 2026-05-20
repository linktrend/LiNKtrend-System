# WP-002 — Day-1 decision freeze

## Objective

Close, defer, or **explicitly stub** the Day-1 platform forks so the 7-day MVO path does not stall on unresolved integration choices.

## Context

Pending items live in `DECISIONS.md` (CRM, Plane, preview publishing, OpenClaw source, Supabase mode, model routing, template source, audit event contract).

## Tasks

1. For each **Pending** row in `DECISIONS.md`, assign a provisional **owner agent** (in agent reports) and a target outcome: **Accepted**, **Stubbed**, or **Deferred (with reason)**.
2. If **Stubbed**, add a matching row or update in `INTEGRATION_QUEUE.md` with stub behavior and acceptance for MVO demo.
3. If **Accepted**, add one line to `AGENT_COORDINATION.md` → **Decisions Made** linking back to the table row.
4. Ensure **LEXOS/legal** work remains out of scope per `ARCHITECTURE_RULES.md` until WebsiteFactory MVO works (note explicitly if any request appears).

## Acceptance criteria

- [ ] Every row in `DECISIONS.md` is either **Accepted**, **Stubbed**, or **Deferred** with rationale (no silent Pending).
- [ ] `INTEGRATION_QUEUE.md` reflects all **Stubbed** integrations with clear demo behavior.
- [ ] `MASTER_PLAN.md` time targets remain coherent (7-day may rely on stubs).

## Required proof

- Updated `DECISIONS.md` table (screenshot not required; cite row statuses in agent report).
- `AGENT_COORDINATION.md` **Day-1 Decisions To Freeze** section updated to “frozen as of <date>” or lists remaining **Deferred** items with owners.

## Out of scope

Implementing stubs in code (this packet is decision/documentation hygiene only unless separately authorized).
