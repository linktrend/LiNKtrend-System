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
| Zulip | `cap.zulip.run_messaging` | Implemented/temporary gateway | `/Users/linktrend/Projects/link-zulip` and future OpenClaw native channel | All modules. |
| Plane | `cap.plane.execution_tracking`, `plane.project.create`, `plane.task.create` | Implemented | `/Users/linktrend/Projects/link-plane` | All modules. |
| Public research | `cap.research.public_web` | Implemented | public web/search providers | All modules. |
| Asset generation | `cap.asset.generation` | Implemented/mock | provider-agnostic image/video/media generation | LinkSites, Linktrend Media, and modules needing media assets. |
| Postiz | `cap.postiz.distribution` | Implemented/mock | `/Users/linktrend/Projects/link-postiz-app` | Linktrend Media/content and marketing workflows. |
| GitHub | `cap.github.repo_management` | Declared | GitHub | LiNKapps and software-development modules. |
| Stripe | `cap.stripe.product_management` | Declared | Stripe | All modules needing payment processing. |
| DigitalOcean | `cap.digitalocean.deployment`, `cap.digitalocean.infrastructure` | Pending | DigitalOcean | Primary deployment/infrastructure target across modules. |
| EAS | `cap.eas.build` | Declared | Expo Application Services | LiNKapps/mobile app tracks. |
| Vercel | `cap.vercel.deployment` | Declared | Vercel | Optional web deployment target, secondary to DigitalOcean where applicable. |
| Chatwoot | `cap.chatwoot.customer_support` | Live (MVO) | `/Users/linktrend/Projects/link-chatwoot` | Support, CRM, Linktrend Media, and client-facing modules. |
| GlitchTip | `cap.glitchtip.error_monitoring` | Pending | `/Users/linktrend/Projects/link-GlitchTip` | All deployed modules/services needing error monitoring. |
| GrowthBook | `cap.growthbook.feature_flags` | Pending | `/Users/linktrend/Projects/link-growthbook` | LiNKapps and modules needing experiments/feature flags. |
| Listmonk | `cap.listmonk.email_marketing` | Pending | `/Users/linktrend/Projects/link-listmonk` | Linktrend Media and marketing workflows. |
| LLM Council | `cap.llm_council.deliberation` | Pending | `/Users/linktrend/Projects/link-llm-council` | Strategy, validation, legal, BD, and high-impact decisions. |
| Metabase | `cap.metabase.analytics` | Pending | `/Users/linktrend/Projects/link-metabase` | Finance, operations, LinkApps, reporting modules. |
| LEXOS extraction (parser) | `cap.extraction.parser` | Declared | LlamaParse / comparable layout parsers | `suites/lexos/` — document structure extraction. |
| LEXOS extraction (OCR) | `cap.extraction.ocr` | Declared | OCR providers (Tesseract-class) | `suites/lexos/` — scanned-page text extraction. |
| LEXOS extraction (QA) | `cap.extraction.qa` | Declared | Parser/OCR output QA | `suites/lexos/` — compare and quality-flag extractions. |
| LEXOS evidence storage | `cap.storage.evidence` | Declared | Supabase Storage (evidence buckets) | `suites/lexos/` — governed evidence write/preserve. |
| LEXOS legal research | `cap.research.legal` | Declared | Legal corpora / authority lookup (shadow-tier MVO) | `suites/lexos/` — distinct from `cap.research.public_web`. |
| Paperless | `cap.paperless.document_management` | Pending | `/Users/linktrend/Projects/link-paperless-ngx` | LEXOS, legal department, accounting, and document-heavy modules. |
| SerpBear | `cap.serpbear.seo_tracking` | Pending | `/Users/linktrend/Projects/link-serpbear` | Linktrend Media, LinkSites, SEO workflows. |
| Traefik | `cap.traefik.edge_routing` | Pending | `/Users/linktrend/Projects/link-traefik` | Infrastructure/deployment routing. |
| Typebot | `cap.typebot.conversation_flows` | Pending | `/Users/linktrend/Projects/link-typebot.io` | Linktrend Media, lead capture, support, and client-facing modules. |
| Umami | `cap.umami.web_analytics` | Pending | `/Users/linktrend/Projects/link-umami` | LinkSites, Linktrend Media, LiNKapps, web modules. |
| Vaultwarden | `cap.vaultwarden.secret_sharing` | Pending | `/Users/linktrend/Projects/link-vaultwarden` | Operator/team credential sharing where approved. |

## Rule

Any module can request any connector through a governed LinkSkills lease if policy allows it. Initial module use does not make the connector module-owned.
