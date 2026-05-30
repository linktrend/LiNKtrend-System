# Suite Registry

> **Folder migration:** Tenant-enabled suite packages live in `suites/`. Paths in new docs and manifests should use `suites/` as the target. See [`docs/terminology.md`](../docs/terminology.md).

This registry tracks tenant-enabled **Suites** (product packages). A suite may be active, planned, or reserved. Within each suite, vendor-published **Modules** (recipes: phases, issues, assignees) are defined separately — see LiNKaios work hierarchy in `docs/terminology.md`.

| Suite | Status | Purpose | External Repo | Notes |
| --- | --- | --- | --- | --- |
| `linksites` | Active MVO | Lead-to-preview-site WebsiteFactory flow. | `/Users/linktrend/Projects/LiNKsites` | Current code still lives partly in `LiNKaios/linkaios-web/src/lib/suite-integrations/websitefactory` (target: `lib/suite-integrations/`). |
| `linkapps` | Active discovery | App factory for venture software creation. | `/Users/linktrend/Projects/LiNKapps` | Suite home represents the LiNKaios connector/declaration, not the full external repo. |
| `linktrend-media` | Planned | Content and marketing production workflows. | TBD | Uses Postiz/Listmonk/Typebot/asset generation and other marketing capabilities as approved. |
| `lexos/litigation` | Active discovery | LEXOS litigation practice workflow. | `/Users/linktrend/Projects/LiNKtrend-LEXOS` | First practice area in LEXOS suite family. |
| `lexos/intellectual-property` | Reserved | Future LEXOS IP practice area. | `/Users/linktrend/Projects/LiNKtrend-LEXOS` | No workflow invented yet. |
| `lexos/corporate` | Reserved | Future LEXOS corporate practice area. | `/Users/linktrend/Projects/LiNKtrend-LEXOS` | No workflow invented yet. |
| `accounting` | Planned | Tenant accounting department operations. | Uses `link-odoo` capability connector | Uses Odoo accounting and related finance capabilities. |
| `finance` | Planned | Finance planning, allocation, and reporting. | Uses `link-odoo`, `link-metabase` | Avoid duplicating Odoo as operational system of record. |
| `legal-department` | Planned | General legal operations outside LEXOS practice modules. | TBD | May use LEXOS, Odoo, Paperless, and research capabilities. |
| `business-development` | Planned | Venture pipeline, market research, and qualification. | TBD | Uses CRM, public research, Plane, Zulip, and analytics capabilities. |
| `dental-clinic` | Reserved | Future industry suite for dental clinic clients. | TBD | May combine operations, marketing, accounting, CRM, and scheduling capabilities. |
| `restaurant` | Reserved | Future industry suite for restaurant clients. | TBD | May combine local operations, marketing, accounting, CRM, and review/analytics capabilities. |

## Rule

Suites describe workflows and required surfaces. They do not own capability connector implementations. Connectors live under LinkSkills; LiNKaios UI refers to them as **Capabilities**.

Every active suite must maintain one canonical workflow map in its suite folder (target: `suites/<name>/`). For example, `suites/linksites/workflow.ts` or `suites/linksites/workflow.md` should describe the LinkSites lead-to-preview-site spine and reference LiNKautowork handlers, LiNKbot roles, LinkSkills capability connectors, LiNKbrain events, Plane tasks, and any external repo assets it needs.
