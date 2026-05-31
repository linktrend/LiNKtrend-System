# Product constraints

Boundaries for **LiNKtrend-System** (`LiNKaios` monorepo). Issues link here when scope questions arise.

**Canonical product truth:** [`PRINCIPAL_PRODUCT_DEFINITION.md`](PRINCIPAL_PRODUCT_DEFINITION.md)

---

## Repo boundaries

| In this repo | External / not here |
|--------------|---------------------|
| LiNKaios Client + Admin UI and kernel | **LiNKsites** product: Payload CMS, templates, frontend, VPS publish (`/Users/linktrend/Projects/LiNKsites`) |
| Suite workflow maps (`suites/linksites/`) | Full n8n fork (`/Users/linktrend/Projects/LiNKautowork`) |
| LinkSkills capability connectors | LiNKbot engine fork (`LiNKbot-core`) |
| LiNKbot roles, adapters, comm profiles | Zulip server native data (bridge metadata only in `gateway` schema) |
| LiNKautowork gateway + workflow templates | |

Do **not** copy LiNKsites templates, Payload schemas, or frontend build into this monorepo. Integrate via Capabilities and documented contracts.

---

## MVO required integrations

These are **required** for MVO — not optional stubs:

| System | Role in MVO |
|--------|-------------|
| **Supabase** | Auth, Postgres, RLS, kernel/brain/schemas |
| **Zulip** | Project streams, topics, LiNKbot/human threads (`cap.zulip.run_messaging`) |
| **Plane** | Execution tracking; studio-provided secrets via GSM (`cap.plane.execution_tracking`) |
| **Payload CMS** | LinkSites publish target (local/sync via Capability; lives in LiNKsites repo) |
| **CRM / Odoo shadow** | Lead records and status through governed Capability |

Post-MVO Suites (LinkApps, LEXOS, etc.) are **out of scope** until MVO ships.

---

## Security and secrets

- All secrets in **Google Secret Manager**; never commit credentials
- Tenant data: every table carries `tenant_id`; RPC/RLS access patterns only
- Side effects require **LinkSkills leases** — no direct bot writes to external systems
- LiNKguard wipes skill traces after bot execution; anonymization rules apply before world brain writes
- Outreach and publish side effects remain governed; Principal approval where policy requires

---

## Delivery constraints

- **No phasing:** development continues until full MVO (Client + Admin + LinkSites one-lead E2E)
- Reuse existing code; do not rebuild working systems
- If discovery blocks progress, document gap and stop-and-ask — do not invent Payload/Odoo/CRM business schemas
- Cost controls: avoid unnecessary premium model usage; record expensive operations
- Git: work on short-lived branches; promote `development → staging → main`; Principal Release OK before main

---

## Non-goals (MVO)

- Shipping non-LinkSites Suites
- Customer-supplied Plane URL/keys in MVO (studio bundles Plane)
- Full Odoo/QuickBooks UI mirroring in LiNKaios
- Parallel orchestration outside LiNKdev factory
- Fake success without audit, lease, memory, and trace proof

---

## Stack reference

See [`STACK.md`](STACK.md) for languages, package managers, and verify commands.

See [`REPO_INVENTORY.md`](REPO_INVENTORY.md) for folder ownership map.
