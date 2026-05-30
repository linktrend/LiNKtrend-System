# Development Method v2

## Goal

The goal is to produce a working internal MVO of the LiNKtrend AI Agent Ecosystem as fast as possible, while avoiding architectural debt that would make the system unusable after the demo.

The formal plan should assume 21 days. The operational execution target should be 7 days. This is not a contradiction. The 21-day plan prevents reckless shortcuts; the 7-day target forces aggressive reuse and parallelism.

The first successful MVO should demonstrate the LinkSites / WebsiteFactory flow:

A LiNKbot receives or starts a mission to find a lead, selects a potential SMB lead, chooses an industry template, generates business-specific copy, selects or places suitable images/placeholders, changes the look-and-feel without changing the template structure, publishes a preview site, creates CRM and Plane records or approved MVO stubs, logs execution events, writes memory, and displays trace/status inside LiNKaios.

## Core Correction From Architect Review

The previous plan was too “greenfield.” The corrected method is “wire existing code.”

The architect review confirmed substantial existing assets:

- LiNKaios UI exists in `LiNKtrend-System/LiNKaios/linkaios-web`.
- LinkSkills Phase 0–3 logic-engine exists in `LiNKskills/services/logic-engine`.
- LiNKautowork gateway MVO exists in `LiNKautowork`.
- LiNKbrain v0 schema exists in `Archive/LiNKaios/packages/linkbrain`.
- LinkSites Payload CMS and templates exist in `LiNKsites`.
- UI/design-system ancestor exists in `LiNKapps`.
- LiNKbot/OpenClaw runtime exists in `LiNKbot-core`.

Therefore the development method should not start by creating new skeletons unless a component is actually missing.

## Development Philosophy

The ecosystem is developed from the operating loop outward:

LiNKaios tracks the work. LiNKbot reasons where judgment is needed. LinkSkills authorizes capabilities. LiNKautowork executes deterministic steps. LiNKbrain records memory and audit. LiNKaios displays state and trace.

Everything that does not support this loop is deferred.

## First Build Principle

If an existing component exists and can be wired in less time than rebuilding it, wire it.

If an existing component is too messy, build a thin MVO adapter around it rather than trying to refactor the whole thing during the first sprint.

If a third-party integration blocks the flow, stub it with a local table or test adapter, then record the real integration as a post-MVO task.

## Human Supervision

Carlos can supervise approximately 12 hours per day. The bottleneck is not token budget; it is integration decision-making and supervision. The agent system must reduce manual coordination by using `dev-swarm/` files, reports, issues, branches, and merge queues.

## What Must Be Built Or Wired First

1. `dev-swarm/` coordination layer (`dev-swarm/product/grounding/` for plans and contracts).
2. Repo verification and reuse map.
3. WebsiteFactory plugin manifest.
4. Minimal shared contracts.
5. LiNKbrain audit/event receiver based on archived schema.
6. LinkSkills lease/run path based on existing logic-engine.
7. LiNKautowork workflow trigger using existing gateway.
8. LiNKbot OpenClaw adapter based on existing `LiNKbot-core`.
9. LiNKaios dashboard wiring using existing 12 routes.
10. LinkSites preview publishing using existing Payload/template stack.

## What Must Not Be Built First

Do not build LEXOS. Do not build the full marketplace. Do not build all vertical plugins. Do not build full cross-tenant intelligence. Do not build a new workflow engine. Do not build a new agent runtime. Do not build a new template engine if LinkSites can provide the first version. Do not overbuild MCP/A2A support before the MVO loop works.
