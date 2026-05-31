# LiNKtrend AI Agent Ecosystem — Development Plan v2

## Purpose

This document set describes **how LiNKdev executes** against Principal product truth. It does not replace that truth.

**Canonical MVO:** [`05_MVO_Scope_and_Demo_Flow_v2.md`](./05_MVO_Scope_and_Demo_Flow_v2.md)  
**Principal definition:** `LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md`  
**Terminology:** `docs/terminology.md`

## MVO posture (May 2026)

**MVO is not phased.** There is no “phase 1 demo” with a lower bar. MVO is **done** or **not done** when Principal can evaluate:

- **LiNKaios Client** + **LiNKtrend Admin**
- End-to-end **LinkSites Suite**: online lead discovery (e.g. Google Maps) → industry/template → custom site → **live publish** (`businessname.linktrend.media`) → **outreach** → subscribe (domain + transfer) or reject (recycle site)

**Out of MVO:** LinkApps, LEXOS, other suites.

Older references in this folder to **7-day compression**, **21-day planning**, **seed CSV leads**, or **draft-only outreach** describe a **superseded execution style** — see banners on individual files. They remain useful for reuse maps and work-packet structure, not for lowering the MVO bar.

## Development posture

> **Wire existing code, govern side effects, prove the full LinkSites commercial loop with audit traces.**

Substantial assets already exist (LiNKaios web, LinkSkills logic-engine, LiNKautowork gateway, LiNKsites Payload stack, LiNKbot adapters). The job is integration and completion to Principal bar — not greenfield skeletons.

## Target flow (summary)

Operator or LiNKbot discovers a lead (Maps or approved provider), runs LinkSites issues under lease, publishes via external **LiNKsites** + VPS temp URL, executes **outreach**, records outcome in CRM/Plane equivalents, writes LiNKbrain events, and shows unified trace in LiNKaios Client; LiNKtrend Admin shows tenant and capability posture.

## Critical decisions (bind early)

Freeze in `LiNKdev/product/grounding/DECISIONS.md`:

1. Lead provider API (Maps or approved alternative) — **not** seed-CSV-only for MVO completion.
2. Publish path: Payload + VPS `*.linktrend.media` via **LiNKsites** repo.
3. Outreach channel and approval posture — **real outreach required** for MVO (governed, not draft-only).
4. Default v1 capabilities: **Zulip** + **Plane** operational for demo.
5. OpenClaw / adapter source of truth for LinkSites roles.
6. Audit union into LiNKbrain for every side effect.

## Document index

| # | File | Notes |
|---|------|--------|
| 1 | `01_Development_Method_v2.md` | Method — **banner** for MVO bar |
| 2 | `02_Tool_and_Model_Strategy_v2.md` | Models/tools |
| 3 | `03_Swarm_Coordination_Model_v2.md` | Parallel agents |
| 4 | `04_Repo_Strategy_and_Reuse_Map_v2.md` | Reuse map |
| 5 | **`05_MVO_Scope_and_Demo_Flow_v2.md`** | **MVO authority** |
| 6 | `06_Compressed_7_Day_vs_Conservative_21_Day_Plan_v2.md` | Timeline — **banner** |
| 7 | `07_Work_Packets_v2.md` | Packets — **banner** |
| 8 | `08_Branching_Worktree_and_Integration_v2.md` | Git/worktrees |
| 9 | `09_Cost_Control_and_Model_Allocation_v2.md` | Cost |
| 10 | `10_Agent_Operating_Rules_v2.md` | Agent rules — **banner** |
| 11 | `11_Deployment_Target_v2.md` | Deploy |
| 12 | `12_Risks_Decisions_and_Stubs_v2.md` | Stubs — **banner** |

## First steps for LiNKdev

1. Confirm `LiNKdev/` wired; read **PRINCIPAL_PRODUCT_DEFINITION** and active issue `read_first`.
2. Verify reuse map (`04_`) against current repos — especially **LiNKsites** publish path.
3. Align WebsiteFactory / LinkSites suite manifest to **`05_`** before wide implementation.

## Audience

- **Principal** — evaluates demo against **`05_`** and Principal definition.
- **LiNKdev** — executes issues; updates grounding reports, not chat memory.
