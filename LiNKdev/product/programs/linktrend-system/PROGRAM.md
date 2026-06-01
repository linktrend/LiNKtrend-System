---
program_id: linktrend-system
title: LiNKtrend System MVO completion
status: running
chairman_review_schedule:
  - after_wave: 2
  - after_wave: 5
---

# Program plan: linktrend-system

## Finished product (plain English)

When every issue in this program is **done**, the Principal can run a real **LinkSites** demonstration end to end:

A licensee signs into **LiNKaios Client**, enables the LinkSites Suite, and launches a **Project** for one business lead. Progress appears on the Project detail page with **traces** that show LinkSkills leases, LiNKautowork workflow runs, LiNKbrain audit events, and LiNKbot steps. **Zulip** carries project messaging (stream per Project, topics for phases/issues). **Plane** tracks execution tasks (studio-provided capability; mock/shadow acceptable where CONTRACTS_MVO allows).

LiNKbots perform governed research and website packaging; LiNKautowork writes artifacts, mirrors to Supabase, syncs to Payload, and runs preview checks. The site is **published** at a live or MVO-equivalent URL (`businessname.linktrend.media`). **Outreach** executes under governance (draft-only or Principal-approved send per policy — not skipped). The operator can **close or recycle** the lead per suite rules.

On **LiNKtrend Admin**, vendor staff can manage the demo tenant, Suite visibility, and minimum fleet/troubleshoot surfaces needed for the same run.

No plane fakes success: every side-effecting step produces lease + workflow + audit + trace artifacts visible in LiNKaios. LinkSites product assets (templates, Payload CMS, frontend) stay in the external **LiNKsites** repo; this program integrates and orchestrates only.

**Principal Go** recorded 2026-06-01. Grounding and INTENT were Principal-approved May 2026; this plan operationalizes them into the LiNKdev issue DAG.

## Program Definition of Done (DS-B14)

- [ ] All issues `done` in STATE
- [ ] Release issue LTS-900 passed verify + proof manifest at `LINKDEV_TIER=critical`
- [ ] `LiNKdev/product/grounding/SHIP_CRITERIA.md` satisfied
- [ ] Demo evidence recorded in `LiNKdev/product/reports/linktrend-system/STATUS.md`
- [ ] Principal Release OK before staging/main (Principal-only)

## Modules

### linkaios — Control plane UI and kernel

**README:** `modules/linkaios/README.md`

#### Phase foundation — Kernel and shells

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-001 | Kernel trace spine and Project/Run model | cursor | standard | [] | W1 |
| LTS-002 | Client shell auth Suites and Project navigation | cursor | standard | LTS-001 | W2 |
| LTS-003 | Admin shell MVO vendor tenant surfaces | cursor | standard | LTS-001 | W2 |

### linkskills — Capability governance

**README:** `modules/linkskills/README.md`

#### Phase governance — Catalog and leases

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-010 | Capability catalog and lease lifecycle API | cursor | standard | LTS-001 | W1 |
| LTS-011 | LinkSites capability connectors and leases | cursor | standard | LTS-010 | W3 |

### linkbrain — Memory and audit

**README:** `modules/linkbrain/README.md`

#### Phase audit — Events and envelope

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-020 | Audit envelope and run/stage/lease events | cursor | standard | LTS-001 | W1 |

### linkautowork — Deterministic workflows

**README:** `modules/linkautowork/README.md`

#### Phase workflows — LinkSites handles

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-030 | LinkSites deterministic workflow handles | cursor | standard | LTS-011, LTS-020 | W4 |

### linkbot — Role-bound runtime

**README:** `modules/linkbot/README.md`

#### Phase runtime — LinkSites roles

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-040 | LinkSites LiNKbot roles and governance adapter | cursor | standard | LTS-010, LTS-020 | W3 |

### linkguard — Worker security

**README:** `modules/linkguard/README.md`

#### Phase security — Session and IP hygiene

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-050 | Session cleanup and skill-trace wipe hooks | cursor | standard | LTS-040 | W5 |

### linksites — Suite integration and E2E

**README:** `modules/linksites/README.md`

#### Phase integration — Capabilities and UI

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-060 | Suite workflow map aligned to SHIP_CRITERIA | cursor | standard | LTS-030, LTS-040 | W5 |
| LTS-061 | Zulip and Plane capability integration | cursor | standard | LTS-002, LTS-060 | W6 |
| LTS-062 | Client operator panels for LinkSites run | cursor | standard | LTS-061, LTS-003 | W7 |

#### Phase e2e — One-lead proof

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-063 | One-lead publish URL and governed outreach | cursor | standard | LTS-062 | W8 |

### release — Ship

**README:** `modules/release/README.md`

#### Phase ship — Release

| Issue | Title | Runtime | Tier | Depends on | Parallel group |
|-------|-------|---------|------|------------|----------------|
| LTS-900 | Program release verify and proof manifest | cursor | critical | LTS-001, LTS-002, LTS-003, LTS-010, LTS-011, LTS-020, LTS-030, LTS-040, LTS-050, LTS-060, LTS-061, LTS-062, LTS-063 | — |

## Parallel groups

- **W1:** LTS-001, LTS-010, LTS-020 (foundation spine; wave cap 3)
- **W2:** LTS-002, LTS-003 (after LTS-001)
- **W3:** LTS-011, LTS-040 (after W1/W2 prerequisites)
- **W4:** LTS-030
- **W5:** LTS-050, LTS-060
- **W6:** LTS-061
- **W7:** LTS-062
- **W8:** LTS-063
- **Release:** LTS-900 after all module issues done

## Active wave cap

Orchestrator sets at most **3** concurrent `linkdev:ready` issues (W1 first: LTS-001, LTS-010, LTS-020).

## Codex automation checklist

| Issue | Trigger labels | Paths filter | Automation name |
|-------|----------------|--------------|-----------------|
| _(none in MVO wave 1)_ | `linkdev:ready`, `runtime:codex` | — | LiNKdev-executor-codex (not wired) |

## Cursor automation checklist

| Role | Trigger | Automation name |
|------|---------|-----------------|
| Orchestrator | Merge to `development` / workflow dispatch | LiNKdev dispatch |
| Reviewer | `linkdev:review-ready` | LiNKdev-reviewer |
| Integrator | `linkdev:merge-ready` | LiNKdev-integrator |
| Executor (cursor) | `linkdev:ready`, `runtime:cursor` | LiNKdev-executor-cursor |

## DAG notes

`LiNKdev/factory/scripts/validate-dag.sh LiNKdev/product/programs/linktrend-system/PROGRAM.md`

Legacy work packets under `issues/legacy/` are reference-only; executors must use nested issues above.
