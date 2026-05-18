# Capability Connector Registry

Status meanings:

- **Implemented:** handler/catalog support exists in this repo.
- **Declared:** manifest/spec exists but handler extraction or runtime support is incomplete.
- **Pending:** connector target is known, but the connector still needs to be designed.

| Connector | Capability IDs / Scope | Status | Target Software | Used By |
| --- | --- | --- | --- | --- |
| Odoo CRM | `cap.crm.odoo_shadow`, `crm.upsert` | Implemented/partial | `/Users/linktrend/Projects/link-odoo` | All modules that need CRM/customer records. |
| Odoo Accounting | `cap.accounting.odoo_shadow` | Declared/partial | `/Users/linktrend/Projects/link-odoo` | All modules that need accounting, invoices, subscriptions, or allocations. |
| Payload | `cap.payload.local_sync` | Implemented | `/Users/linktrend/Projects/LiNKsites` Payload CMS | LinkSites. |
| Supabase content/data | `cap.supabase.mirror_content`, `cap.storage.supabase`, `cap.supabase.provisioning` | Implemented/declared | Supabase | All modules when database/storage is needed. |
| Supabase Storage (Evidence) | `cap.storage.evidence` | Declared | Supabase Storage | LEXOS for evidence file storage. |
| Zulip | `cap.zulip.run_messaging` | Implemented/temporary gateway | `/Users/linktrend/Projects/link-zulip` and future OpenClaw native channel | All modules. |
| Plane | `cap.plane.execution_tracking`, `plane.project.create`, `plane.task.create` | Implemented | `/Users/linktrend/Projects/link-plane` | All modules. |
| Public research | `cap.research.public_web` | Implemented | public web/search providers | All modules. |
| Legal research | `cap.research.legal` | Declared/shadow | Legal research APIs (Westlaw, LexisNexis, etc.) | LEXOS litigation module. |
| Asset generation | `cap.asset.generation` | Implemented/mock | provider-agnostic image/video/media generation | LinkSites, Linktrend Media, and modules needing media assets. |
| Postiz | `cap.postiz.distribution` | Implemented/mock | `/Users/linktrend/Projects/link-postiz-app` | Linktrend Media/content and marketing workflows. |
| Document extraction (OCR) | `cap.extraction.ocr` | Declared | OCR engines (LlamaParse, Google Document AI, etc.) | LEXOS for evidence text extraction. |
| Document parsing | `cap.extraction.parser` | Declared | Document parsers (LlamaParse, Layout Parser) | LEXOS for document structure extraction. |
| Extraction QA | `cap.extraction.qa` | Declared | QA comparator for extraction validation | LEXOS for extraction quality assurance. |
| LLM generation | `cap.llm.generation` | Declared | LLM providers (configurable) | LEXOS for drafting, research, critique. |
| Mock CRM | `cap.crm.mock` | Declared | Local Postgres tables | LEXOS MVO (placeholder for real CRM). |
| Mock Plane | `cap.plane.mock` | Declared | Local Postgres tables | LEXOS MVO (placeholder for real Plane). |
| GitHub | `cap.github.repo_management` | Declared | GitHub | LiNKapps and software-development modules. |
| Stripe | `cap.stripe.product_management` | Declared | Stripe | All modules needing payment processing. |
| DigitalOcean | `cap.digitalocean.deployment`, `cap.digitalocean.infrastructure` | Pending | DigitalOcean | Primary deployment/infrastructure target across modules. |
| EAS | `cap.eas.build` | Declared | Expo Application Services | LiNKapps/mobile app tracks. |
| Vercel | `cap.vercel.deployment` | Declared | Vercel | Optional web deployment target, secondary to DigitalOcean where applicable. |
| Chatwoot | `cap.chatwoot.customer_support` | Pending | `/Users/linktrend/Projects/link-chatwoot` | Support, CRM, Linktrend Media, and client-facing modules. |
| GlitchTip | `cap.glitchtip.error_monitoring` | Pending | `/Users/linktrend/Projects/link-GlitchTip` | All deployed modules/services needing error monitoring. |
| GrowthBook | `cap.growthbook.feature_flags` | Pending | `/Users/linktrend/Projects/link-growthbook` | LiNKapps and modules needing experiments/feature flags. |
| Listmonk | `cap.listmonk.email_marketing` | Pending | `/Users/linktrend/Projects/link-listmonk` | Linktrend Media and marketing workflows. |
| LLM Council | `cap.llm_council.deliberation` | Pending | `/Users/linktrend/Projects/link-llm-council` | Strategy, validation, legal, BD, and high-impact decisions. |
| Metabase | `cap.metabase.analytics` | Pending | `/Users/linktrend/Projects/link-metabase` | Finance, operations, LinkApps, reporting modules. |
| Paperless | `cap.paperless.document_management` | Pending | `/Users/linktrend/Projects/link-paperless-ngx` | LEXOS, legal department, accounting, and document-heavy modules. |
| SerpBear | `cap.serpbear.seo_tracking` | Pending | `/Users/linktrend/Projects/link-serpbear` | Linktrend Media, LinkSites, SEO workflows. |
| Traefik | `cap.traefik.edge_routing` | Pending | `/Users/linktrend/Projects/link-traefik` | Infrastructure/deployment routing. |
| Typebot | `cap.typebot.conversation_flows` | Pending | `/Users/linktrend/Projects/link-typebot.io` | Linktrend Media, lead capture, support, and client-facing modules. |
| Umami | `cap.umami.web_analytics` | Pending | `/Users/linktrend/Projects/link-umami` | LinkSites, Linktrend Media, LiNKapps, web modules. |
| Vaultwarden | `cap.vaultwarden.secret_sharing` | Pending | `/Users/linktrend/Projects/link-vaultwarden` | Operator/team credential sharing where approved. |

## LEXOS-Specific Capability Notes

### Document Extraction Capabilities

The following capabilities are required for LEXOS litigation evidence processing:

- **`cap.extraction.ocr`**: Text extraction from scanned documents and images
- **`cap.extraction.parser`**: Structured document parsing (PDF, DOCX, etc.)
- **`cap.extraction.qa`**: Quality assurance comparison across extraction methods

MVO Mode: Local extraction or configurable provider (LlamaParse equivalent).

### Legal Research Capability

- **`cap.research.legal`**: Authority search, citation verification, jurisdiction checking

MVO Mode: Shadow mode only (no real API calls to Westlaw/LexisNexis).

### LLM Generation Capability

- **`cap.llm.generation`**: Text generation, structured output, embeddings

Used across W2, W6, W7, W8, W9, W11 for drafting and analysis.

### Mock Capabilities for MVO

- **`cap.crm.mock`**: Local Postgres tables simulating CRM
- **`cap.plane.mock`**: Local Postgres tables simulating Plane

These will be replaced with real `cap.crm.odoo` and `cap.plane.execution_tracking` post-MVO.

## Rule

Any module can request any connector through a governed LinkSkills lease if policy allows it. Initial module use does not make the connector module-owned.
