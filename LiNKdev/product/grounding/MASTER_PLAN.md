# Master plan — path to MVO

High-level delivery path. **Not** an issue DAG — the Planner builds the program from [`INTENT.md`](INTENT.md) and [`SHIP_CRITERIA.md`](SHIP_CRITERIA.md).

**Canonical definition:** [`PRINCIPAL_PRODUCT_DEFINITION.md`](PRINCIPAL_PRODUCT_DEFINITION.md)

---

## Outcome

Deliver **LiNKtrend System MVO**:

1. **LiNKaios Client** — licensee operates LinkSites Project with traces and approvals  
2. **LiNKtrend Admin** — vendor manages demo tenant and fleet for MVO  
3. **LinkSites E2E** — one lead: discover → build → publish (`businessname.linktrend.media`) → outreach → close or recycle  

All planes participate with audit, leases, and trace visibility. **No phasing** — continue until complete.

---

## Workstreams

### A. Foundation (control plane + infra)

- Supabase schemas, RLS, exposed API schemas for kernel/brain/skills
- LiNKaios kernel: tenants, Projects, Runs, stages, trace joins
- GSM-backed secrets for Supabase, Zulip, Plane, OpenRouter
- Client shell: auth, Suites navigation, Project detail, trace/status views
- Admin shell: minimum vendor surfaces for MVO tenant and Suite management

### B. Planes wired for governance

| Plane | MVO deliverables |
|-------|------------------|
| **LinkSkills** | Capability catalog, lease lifecycle, LinkSites connector set, progressive disclosure hooks |
| **LiNKautowork** | Workflow handles: artifact, Supabase mirror, Payload sync, preview checks, CRM/outreach gates |
| **LiNKbot** | LinkSites roles: lead scout, research, website builder, outreach; runtime adapter + governance payload |
| **LiNKbrain** | Audit envelope writer, run/stage/lease events, Librarian entry points (minimum viable loop) |
| **LiNKguard** | Session cleanup, skill-trace wipe hooks on bot completion |

### C. Default Capabilities (studio-provided)

- **Zulip** — project stream per Project, topics for phases/issues
- **Plane** — bootstrap empty project from Suite template; sync issues/cycles
- **Supabase** — platform persistence and mirror tables (discovered from LiNKsites where applicable)
- **Payload sync** — connector to local/shared Payload in LiNKsites repo
- **CRM/Odoo shadow** — lead record and status for outreach gate
- **Public research, asset generation** — as required by LinkSites workflow

### D. LinkSites Suite integration

- Canonical workflow map: `suites/linksites/workflow.md` (align with [`CONTRACTS_MVO.md`](CONTRACTS_MVO.md))
- LiNKaios Client panels for operator flow (lead, build status, preview URL, outreach)
- Cross-repo contracts with **`/Users/linktrend/Projects/LiNKsites`** — templates, CMS, frontend, VPS publish
- End-to-end demo script recorded in program STATUS

### E. Verification and release

- LiNKdev `verify.sh` at critical tier for touched scope
- Proof manifests per issue and program
- Principal demo + Release OK
- Promote `development → staging → main`

---

## Explicitly deferred (post-MVO)

- LinkApps, LEXOS, Linktrend Media, and other Suites
- Customer-choice of default Zulip/Plane alternatives
- Full Librarian council/automation-improvement loop at production scale
- Live Odoo/QuickBooks beyond LinkSites CRM needs
- Multi-lead batch and recycle inventory UX polish beyond one-lead proof

---

## Reference documentation

| Path | Content |
|------|---------|
| `docs/architecture/repo-architecture-target.md` | Folder ownership |
| `docs/architecture/system-completion-targets.md` | 90–95% completion targets per plane |
| `docs/terminology.md` | UI ↔ repo terminology |
| `suites/linksites/workflow.md` | LinkSites stage spine |
| `LiNKdev/product/archive/grounding-legacy/` | Pre-2026-05 plans and stub-MVO artifacts |

---

## Success check

Use [`SHIP_CRITERIA.md`](SHIP_CRITERIA.md) — not intermediate "preview-only" checkpoints — as the program exit gate.
