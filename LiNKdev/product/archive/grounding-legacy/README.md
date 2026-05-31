# Archived grounding (pre-2026-05 MVO reset)

**Archived:** 2026-05-31  
**Superseded by:** [`../grounding/PRINCIPAL_PRODUCT_DEFINITION.md`](../grounding/PRINCIPAL_PRODUCT_DEFINITION.md) and active grounding files listed in [`../grounding/README.md`](../grounding/README.md)

---

## Why this archive exists

Before May 2026, product grounding described a **smaller stub MVO**:

- Seed CSV / mock CRM leads instead of governed lead generation
- Preview-only WebsiteFactory path without full publish + outreach
- Optional or stubbed Plane, Zulip, and CRM
- Parallel work on LinkApps, LEXOS, vertical-plugin architecture, and wave-based execution queues

The **Principal MVO reset** (`DEC-2026-05-PRINCIPAL-MVO-RESET` in `DECISIONS.md`) redefined done as:

**LiNKaios Client + LiNKtrend Admin + LinkSites one-lead full E2E** (build, publish on `businessname.linktrend.media`, outreach) with Supabase, Zulip, Plane, and all planes required — **no phasing**.

These files are kept for historical reference and implementation archaeology. **Do not treat them as current program scope** unless an issue explicitly points here for migration work.

---

## What was archived

| Category | Examples in this folder |
|----------|-------------------------|
| LinkApps specs | `LINKAPPS_*.md` |
| LEXOS specs | `LEXOS_*.md` |
| LinkSites stub-MVO v2 | `LINKSITES_VERTICAL_MVO_V2.md`, `LINKSITES_COMPLETION_PLAN.md`, `LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md` |
| Per-plane completion plans | `LINKBRAIN_COMPLETION_PLAN.md`, `LINKSKILLS_COMPLETION_PLAN.md`, `LINKAUTOWORK_COMPLETION_PLAN.md` |
| Plugin architecture v2 | `PLUGIN_ARCHITECTURE_V2.md`, `LINKAIOS_KERNEL_MANIFEST.md` |
| Execution queues / waves | `MERGE_QUEUE.md`, `INTEGRATION_QUEUE.md`, `TODO-WAVE3-REMAINING.md`, `NEXT_WAVE_EXECUTION_PROMPTS.md`, `AGENT_COORDINATION.md`, `PRE_WIRING_READINESS_PLAN.md`, etc. |
| Vertical plugin UI docs | `docs/vertical-plugin-*.md`, `docs/kernel-vertical-route-extension.md` |
| Stub demo runbook | `DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md` (preview-only era) |
| Cross-vertical / LinkApps brain specs | `LINKBRAIN_*`, `LINKSKILLS_CROSS_VERTICAL_*`, `LINKBOT_*` |

---

## Using archived material

- **Planner / Orchestrator:** prefer active grounding only
- **Implementers:** if reviving a pattern, reconcile with `PRINCIPAL_PRODUCT_DEFINITION.md` and `CONTRACTS_MVO.md` first
- **Historical CONTRACTS detail:** the prior long-form plugin contract lived in grounding `CONTRACTS_MVO.md` before reset; git history retains the full v1/v2 text if needed

---

## Active grounding (read instead)

See [`../grounding/README.md`](../grounding/README.md).
