---
program_id: linktrend-system
title: LiNKtrend System MVO completion
status: draft
chairman_review_schedule:
  - after_wave: 2
  - after_wave: 6
---

# Program plan: linktrend-system

**Planner status:** Draft — **Principal Q&A in progress** (protocol correction 2026-06-01). Do **not** set `phase: running` until narrative OK + G2 PASS.

## Finished product (plain English)

When **all issues** in this program are done:

**LiNKaios Client** — A licensee signs in, subscribes to the **LinkSites Suite**, launches a **Project** for **one lead**, approves budgets/knowledge/side effects per role policy, and follows the run on the Project detail page with **full traces** (LinkSkills leases, LiNKautowork workflow runs, LiNKbrain audit events, LiNKbot steps).

**LiNKtrend Admin** — Vendor staff manage the **demo tenant**, **Suite catalogue**, **LiNKbot fleet**, and **troubleshooting** for the same run with cross-tenant safety.

**LinkSites seven-step business process** (one lead, no stubs):

1. **Lead generation** — **D1 B:** one governed **mock** demo lead (full governance; live Maps post-MVO)  
2. **Qualification** — business type and industry  
3. **Template selection** — from LiNKsites external repo  
4. **Custom website build** — copy, media, style within template  
5. **Publish** — Payload CMS; temp URL `businessname.linktrend.media`  
6. **Outreach** — **D2 A:** governed **draft** + Principal approval gate (full trace; not skipped; live send only on explicit Principal approval)  
7. **Close or recycle** — subscribe/transfer or archive for next lead  

**Infrastructure (non-negotiable):** Supabase, Zulip, Plane, all planes wired with audit. **LiNKsites product code** stays in `/Users/linktrend/Projects/LiNKsites`.

**Librarian** — MVO loop: ingest run/Zulip → knowledge proposal → accept/reject/edit → company LiNKbrain (world brain anonymization via LiNKguard policy).

## Traceability to PRINCIPAL_PRODUCT_DEFINITION.md

| PPD section | Requirement | Program coverage | Issues |
|-------------|-------------|------------------|--------|
| §1 | LiNKtrend System = LiNKaios; Client + Admin | Both interfaces in narrative + issues | LTS-002–005, LTS-108 |
| §2 | Suite → Module → Phase → Issue (business) | `linksites` module **seven phases** mirror business steps | LTS-101–107 |
| §3 | Six planes + Librarian + progressive disclosure + LiNKguard | One module per plane + librarian phase | LTS-001, 010–013, 020–021, 030–034, 040–043, 050 |
| §3 | Default Capabilities Zulip + Plane (studio) | Explicit capability issues | LTS-012, 061 implicit in 012+108 |
| §4 | Client vs Admin actions | Separate client/admin phases | LTS-002–005 |
| §5 | MVO = full system + one LinkSites E2E | E2E proof issue + seven phases | LTS-101–108 |
| §5 | Required infrastructure list | Supabase + all planes | LTS-001, 010–050, 012 |
| §5.1–7 | Seven LinkSites steps | One phase + issue per step | LTS-101–107 |
| §5 | Repo boundary | Workflow + issues forbid monorepo product move | LTS-060, 103, READMEs |
| §6–7 | Principal + LiNKdev; non-goals | `release` + out-of-scope in module READMEs | LTS-900 |

**Principal Q&A decisions (binding for executors):**

| ID | Decision |
|----|----------|
| **D1** | **B** — MVO demo uses one **governed mock lead** (lease, audit, trace). Not a skip stage. Live Maps/search post-MVO unless reopened. |
| **D2** | **A** — MVO outreach is **governed draft-only** with Principal approval gate. Full lease/audit/trace. Live send only if Principal explicitly approves during demo. Not a skip stage. |

**Alignment score:** ≥**98%** with D1–D2 recorded; remaining Q&A: D3–D4.

## Program Definition of Done

- [ ] All issues `done` in STATE  
- [ ] `LiNKdev/product/grounding/SHIP_CRITERIA.md` satisfied  
- [ ] LTS-108 demo recorded in `LiNKdev/product/reports/linktrend-system/STATUS.md`  
- [ ] LTS-900 critical verify + SHA256 program manifest (LAW-08)  
- [ ] Principal Release OK before staging/main  

## Modules

### linkaios — Control plane (PPD §3 LiNKaios, §4)

**README:** `modules/linkaios/README.md`

#### Phase kernel

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-001 | Supabase kernel schemas RLS and Project Run spine | cursor | standard | [] | W1 |

#### Phase client

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-002 | Client sign-in Suite subscribe and Project launch | cursor | standard | LTS-001 | W2 |
| LTS-003 | Client traces and side-effect approval surfaces | cursor | standard | LTS-002 | W3 |

#### Phase admin

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-004 | Admin demo tenant and Suite catalogue management | cursor | standard | LTS-001 | W2 |
| LTS-005 | Admin fleet LiNKbots and troubleshooting surfaces | cursor | standard | LTS-004 | W3 |

### linkskills — Capability governance (PPD §3)

**README:** `modules/linkskills/README.md`

#### Phase governance

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-010 | Capability catalog and lease lifecycle | cursor | standard | LTS-001 | W1 |
| LTS-011 | Progressive disclosure and skill IP boundary | cursor | standard | LTS-010 | W4 |

#### Phase capabilities

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-012 | Studio Zulip and Plane default capabilities | cursor | standard | LTS-010 | W4 |
| LTS-013 | LinkSites suite capability connectors | cursor | standard | LTS-012 | W5 |

### linkbrain — Memory and audit (PPD §3)

**README:** `modules/linkbrain/README.md`

#### Phase audit

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-020 | Audit envelope and run stage lease workflow events | cursor | standard | LTS-001 | W1 |

#### Phase librarian

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-021 | Librarian LiNKbot MVO knowledge loop | cursor | standard | LTS-020, LTS-003 | W6 |

### linkautowork — Deterministic workflows (PPD §5)

**README:** `modules/linkautowork/README.md`

#### Phase workflows

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-030 | Autowork artifact write local handle | cursor | standard | LTS-013, LTS-020 | W5 |
| LTS-031 | Autowork Supabase mirror upsert handle | cursor | standard | LTS-030 | W7 |
| LTS-032 | Autowork Payload sync local handle | cursor | standard | LTS-031 | W7 |
| LTS-033 | Autowork preview readiness check handle | cursor | standard | LTS-032 | W8 |
| LTS-034 | Autowork CRM lead status and outreach gate | cursor | standard | LTS-033 | W8 |

### linkbot — Judgment roles (PPD §5)

**README:** `modules/linkbot/README.md`

#### Phase roles

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-040 | Lead scout bot governed lead acquisition | cursor | standard | LTS-011, LTS-020 | W5 |
| LTS-041 | Research enrichment bot provenance bundle | cursor | standard | LTS-040 | W9 |
| LTS-042 | Website builder bot template-guided package | cursor | standard | LTS-041, LTS-013 | W9 |
| LTS-043 | Outreach bot governed contact step | cursor | standard | LTS-034, LTS-042 | W10 |

### linkguard — Worker security (PPD §3)

**README:** `modules/linkguard/README.md`

#### Phase security

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-050 | Session cleanup skill trace wipe confidentiality | cursor | standard | LTS-011, LTS-040 | W5 |

### linksites — LinkSites Suite seven business phases (PPD §5)

**README:** `modules/linksites/README.md`

#### Phase suite-map

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-060 | Canonical workflow map matches Principal MVO | cursor | standard | LTS-001 | W2 |

#### Phase lead-generation

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-101 | LinkSites phase lead generation one lead | cursor | standard | LTS-060, LTS-040, LTS-002 | W11 |

#### Phase qualification

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-102 | LinkSites phase qualification industry type | cursor | standard | LTS-101, LTS-041 | W12 |

#### Phase template-selection

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-103 | LinkSites phase template selection | cursor | standard | LTS-102, LTS-042 | W12 |

#### Phase website-build

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-104 | LinkSites phase custom website build | cursor | standard | LTS-103, LTS-030 | W13 |

#### Phase publish

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-105 | LinkSites phase publish Payload and temp URL | cursor | standard | LTS-104, LTS-033 | W14 |

#### Phase outreach

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-106 | LinkSites phase governed outreach | cursor | standard | LTS-105, LTS-043 | W15 |

#### Phase close-recycle

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-107 | LinkSites phase close or recycle | cursor | standard | LTS-106 | W16 |

#### Phase e2e-proof

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-108 | MVO demo one lead Client and Admin visibility | cursor | standard | LTS-107, LTS-003, LTS-005, LTS-012 | W17 |

### release — Ship

**README:** `modules/release/README.md`

#### Phase ship

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-900 | Program release verify and SHA256 proof manifest | cursor | critical | LTS-108, LTS-050, LTS-021, LTS-001, LTS-002, LTS-003, LTS-004, LTS-005, LTS-010, LTS-011, LTS-012, LTS-013, LTS-020, LTS-030, LTS-031, LTS-032, LTS-033, LTS-034, LTS-040, LTS-041, LTS-042, LTS-043, LTS-060, LTS-101, LTS-102, LTS-103, LTS-104, LTS-105, LTS-106, LTS-107 | — |

## Parallel groups

- **W1:** LTS-001, LTS-010, LTS-020 (cap 3)  
- **W2:** LTS-002, LTS-004, LTS-060  
- **W3–W17:** per DAG above  
- **Release:** LTS-900 after all  

## Active wave cap

**3** concurrent `linkdev:ready` issues.

## Cursor automation checklist

| Role | Trigger | Automation name |
|------|---------|-----------------|
| Orchestrator | Merge to `development` | LiNKdev dispatch |
| Reviewer | `linkdev:review-ready` | LiNKdev-reviewer |
| Integrator | `linkdev:merge-ready` | LiNKdev-integrator |
| Executor | `linkdev:ready`, `runtime:cursor` | LiNKdev-executor-cursor |

## DAG notes

`LiNKdev/factory/scripts/validate-dag.sh LiNKdev/product/programs/linktrend-system/PROGRAM.md`

Legacy `issues/legacy/` — reference only.
