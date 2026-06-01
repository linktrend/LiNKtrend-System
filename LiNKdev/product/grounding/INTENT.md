# Product intent

**Program ID:** `linktrend-system`  
**Status:** approved — Principal MVO reset May 2026  
**Last updated:** 2026-05-31

Complete the **LiNKtrend System MVO**: LiNKaios **Client + Admin** plus one full **LinkSites** end-to-end run (one lead → built site → published preview URL → outreach) with all planes wired per architecture rules — auditable, governable, and demo-ready.

## Grounding links

| Document | Role |
|----------|------|
| [`PRINCIPAL_PRODUCT_DEFINITION.md`](PRINCIPAL_PRODUCT_DEFINITION.md) | Canonical Principal definition |
| [`VISION.md`](VISION.md) | Product narrative |
| [`SHIP_CRITERIA.md`](SHIP_CRITERIA.md) | Program Definition of Done |
| [`MASTER_PLAN.md`](MASTER_PLAN.md) | High-level delivery path |
| [`CONTRACTS_MVO.md`](CONTRACTS_MVO.md) | LinkSites contracts and capability boundaries |

## What development must accomplish

When the program is complete, the Principal can demonstrate:

1. **LiNKaios Client** — licensee operator flow for LinkSites: project launch, progress, approvals, traces, LiNKbrain visibility.
2. **LiNKtrend Admin** — vendor surfaces needed to manage the demo tenant, Suite, and fleet for MVO.
3. **LinkSites E2E** — one lead through lead generation, template-guided build, Payload/VPS publish (`businessname.linktrend.media`), and outreach, with:
   - LinkSkills capability leases on every side effect
   - LiNKautowork deterministic workflow runs with audit
   - LiNKbot judgment steps (research, build, outreach)
   - LiNKbrain events and memory writes
   - Zulip project messaging and Plane execution tracking
   - LiNKguard session/IP posture on bot runs

LinkSites **product code** (templates, Payload, frontend) remains in the external **`LiNKsites`** repo; this repo integrates and orchestrates.

## Program scope

### In scope

- LiNKaios Client UI/kernel for MVO operator and approval paths
- LiNKtrend Admin UI/kernel for vendor MVO management
- LinkSites Suite workflow map and integration in `suites/linksites/`
- Required Capabilities: Zulip, Plane, Supabase, CRM/Odoo shadow, Payload sync, public research, asset generation (as needed for E2E)
- LiNKautowork workflow handles for deterministic LinkSites stages
- LiNKbrain audit envelope, Librarian hooks (minimum viable for MVO proof)
- LiNKbot roles for LinkSites (lead scout, research, builder, outreach)
- LiNKdev factory coordination for this repo

### Out of scope (until MVO ships)

- LinkApps, LEXOS, Linktrend Media, and other Suites beyond LinkSites
- Customer-owned Plane/Odoo beyond studio MVO defaults
- Moving LiNKsites product implementation into this monorepo
- Parallel orchestration stacks outside LiNKdev
- Promotion to `staging` or `main` without Principal Release OK

## Success criteria

Aligned with [`SHIP_CRITERIA.md`](SHIP_CRITERIA.md):

- [ ] MVO demo recorded (command, URL, or runbook reference in program STATUS)
- [ ] `verify.sh` passes at `LINKDEV_TIER=critical` for release scope
- [ ] Per-issue and program proof manifests where required
- [ ] No open `linkdev:blocked` issues in STATE
- [ ] Principal Release OK before staging/main promotion

## Constraints

- LiNKdev laws: `LiNKdev/factory/laws/LINKDEV_LAWS.md`
- Ecosystem boundaries: `.cursor/rules/02-ecosystem-boundaries.mdc`
- Suite/project terminology: `.cursor/rules/07-suite-project-terminology.mdc`
- Secrets in GSM only: `.cursor/rules/03-secrets-security.mdc`
- Product constraints: [`CONSTRAINTS.md`](CONSTRAINTS.md)

## Principal approval

| Item | Status | Date |
|------|--------|------|
| Product definition (`PRINCIPAL_PRODUCT_DEFINITION.md`) | OK | 2026-05 |
| Intent (this document) | OK | 2026-05-31 |
| Program Go (`linkdev-go`) | In progress — Q&A | 2026-06-01 |
