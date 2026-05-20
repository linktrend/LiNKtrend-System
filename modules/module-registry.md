# Module Registry

This registry tracks tenant-enabled modules. A module may be active, planned, or reserved.

| Module | Status | Purpose | External Repo | Notes |
| --- | --- | --- | --- | --- |
| `linksites` | Active MVO | Lead-to-preview-site WebsiteFactory flow. | `/Users/linktrend/Projects/LiNKsites` | Current code still lives partly in `LiNKaios/linkaios-web/src/lib/plugins/websitefactory`. |
| `linkapps` | Active discovery | App factory for venture software creation. | `/Users/linktrend/Projects/LiNKapps` | Module home represents the LiNKaios connector/declaration, not the full external repo. |
| `linktrend-media` | Planned | Content and marketing production workflows. | TBD | Uses Postiz/Listmonk/Typebot/asset generation and other marketing connectors as approved. |
| `lexos/litigation` | Active discovery | LEXOS litigation practice workflow. | `/Users/linktrend/Projects/LiNKtrend-LEXOS` | First practice area in LEXOS family. |
| `lexos/intellectual-property` | Reserved | Future LEXOS IP practice area. | `/Users/linktrend/Projects/LiNKtrend-LEXOS` | No workflow invented yet. |
| `lexos/corporate` | Reserved | Future LEXOS corporate practice area. | `/Users/linktrend/Projects/LiNKtrend-LEXOS` | No workflow invented yet. |
| `accounting` | Planned | Tenant accounting department operations. | Uses `link-odoo` connector | Uses Odoo accounting and related finance connectors. |
| `finance` | Planned | Finance planning, allocation, and reporting. | Uses `link-odoo`, `link-metabase` | Avoid duplicating Odoo as operational system of record. |
| `legal-department` | Planned | General legal operations outside LEXOS practice modules. | TBD | May use LEXOS, Odoo, Paperless, and research connectors. |
| `business-development` | Planned | Venture pipeline, market research, and qualification. | TBD | Uses CRM, public research, Plane, Zulip, and analytics connectors. |
| `dental-clinic` | Reserved | Future industry module for dental clinic clients. | TBD | May combine operations, marketing, accounting, CRM, and scheduling connectors. |
| `restaurant` | Reserved | Future industry module for restaurant clients. | TBD | May combine local operations, marketing, accounting, CRM, and review/analytics connectors. |

## Rule

Modules describe workflows and required surfaces. They do not own capability connector implementations. Connectors live under LinkSkills.

Every active module must maintain one canonical workflow map in its module folder. For example, `modules/linksites/workflow.ts` or `modules/linksites/workflow.md` should describe the LinkSites lead-to-preview-site spine and reference LiNKautowork handlers, LiNKbot roles, LinkSkills connectors, LiNKbrain events, Plane tasks, and any external repo assets it needs.
