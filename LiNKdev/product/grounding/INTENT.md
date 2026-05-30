# Product intent

**Program ID:** `linktrend-system`  
**Status:** approved  
**Last updated:** 2026-05-30

Deliver the LiNKtrend AI Agent Ecosystem **MVO**: an end-to-end **lead → preview site** flow through LinkSites / WebsiteFactory, with LiNKaios, LiNKbrain, LinkSkills, LiNKautowork, and LiNKbot wired per architecture rules — auditable, governable, and demo-ready.

## Grounding links

- **Vision:** [`VISION.md`](VISION.md) — product narrative (Planner fills after Principal Go)
- **Ship criteria:** [`SHIP_CRITERIA.md`](SHIP_CRITERIA.md) — program Definition of Done checklist for release

## What development must accomplish

When all issues in **linktrend-system** are complete, a Principal or operator can run the WebsiteFactory MVO demo: select or import a lead, choose a template, generate copy, produce a preview site, and see governed traces across LiNKaios (suites/projects UI), capability leases, automation runs, LiNKbot execution, and LiNKbrain audit — with documented stubs only where external integrations are not yet live.

LiNKaios presents suites, modules, projects, phases, and issues with approved terminology. Service ownership stays bounded: no role bleed between control plane, memory, skills, automation, and bot runtime.

## Program scope

### In scope

- LiNKaios control-plane UI and kernel surfaces for the MVO path
- LinkSites / WebsiteFactory module workflow map and operator flow
- LinkSkills capability connectors (shadow/mock modes acceptable per MVO)
- LiNKautowork deterministic workflow execution with audit
- LiNKbrain events, memory writes, and trace visibility
- LiNKbot mission execution for judgment steps
- LiNKdev factory coordination for this repo (`LiNKdev/`)

### Out of scope

- Full live CRM, Plane, or hosted publishing without Principal-approved capability live modes
- Customer-owned Plane/Odoo configuration beyond studio-provided MVO defaults
- New orchestration stacks (CrewAI, LangGraph, n8n brain) parallel to LiNKdev
- Merging to `staging` or `main` without Principal Release OK

## Success criteria

Testable conditions aligned with [`SHIP_CRITERIA.md`](SHIP_CRITERIA.md):

- [ ] Demo command or URL recorded in program STATUS
- [ ] `verify.sh` passes at `LINKDEV_TIER=critical` for release scope
- [ ] Per-issue and program proof manifests emitted where required
- [ ] Merge replay traceability on `development`
- [ ] No open `linkdev:blocked` issues in STATE
- [ ] Principal Release OK before staging/main promotion

## Constraints

- LiNKdev laws: `LiNKdev/factory/laws/LINKDEV_LAWS.md`
- Ecosystem boundaries: `.cursor/rules/02-ecosystem-boundaries.mdc`
- MVO scope and stubs: `.cursor/rules/04-mvo-scope-and-stubbing.mdc`
- Suite/project terminology: `.cursor/rules/07-suite-project-terminology.mdc`
- Secrets in GSM only: `.cursor/rules/03-secrets-security.mdc`

## Principal approval

| Item | Status | Date |
|------|--------|------|
| Finished-product narrative | OK | 2026-05 |
| Intent (this document) | OK | 2026-05-30 |

Intent verdict (G2): `LiNKdev/product/reports/linktrend-system/intent-verdict.json` — must be `PASS` before Orchestrator sets `linkdev:ready`.
