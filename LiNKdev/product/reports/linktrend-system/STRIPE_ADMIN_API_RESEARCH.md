# Stripe Admin API Research

**Date:** 2026-06-10  
**Audience:** Principal (product decision)  
**Context:** LiNKaios Admin → Suites → Stripe products screen currently maps platform/suite offerings to Stripe product IDs manually. Principal asked whether majority of product create / price / billing-frequency work can move into Admin via API.

---

## Executive summary

**Yes — the majority of catalog and pricing work can be done via Stripe API from LiNKaios Admin**, without operators living in the Stripe Dashboard for day-to-day changes. Stripe’s Products + Prices API covers create/update/archive for recurring and one-time offerings, multiple billing intervals, tiers, and metadata.

**Recommended posture:** **Admin-owned catalog with Stripe as billing engine** — LiNKaios Admin becomes the operator UX for product definitions, price creation, and suite-to-Stripe linkage; Stripe Dashboard remains a **break-glass** surface for disputes, tax configuration edge cases, and finance reconciliation.

A pure “mirror + Dashboard popup” model is weaker: it splits mental model, hides audit context, and leaves Marketplace alignment manual.

---

## What Stripe API supports (relevant to LiNKaios)

| Capability | Stripe API | Admin-feasible? | Notes |
|------------|------------|-----------------|-------|
| Create product (name, description, metadata) | `POST /v1/products` | Yes | `metadata` can store `suite_id`, `licensor_tenant_id`, `publish_state`. |
| Update / archive product | `POST /v1/products/:id` | Yes | `active: false` archives without deleting subscription history. |
| Create price (amount, currency) | `POST /v1/prices` | Yes | Prices are immutable amount/currency after create — changes = new price. |
| Recurring billing frequency | `recurring.interval` + `interval_count` | Yes | `day`, `week`, `month`, `year`; e.g. monthly, annual, quarterly via `interval_count`. |
| Multiple prices per product | Multiple `Price` objects | Yes | Standard pattern: one Product, many Prices (monthly/annual/seat bundles). |
| One-time vs subscription | `type: one_time` vs `recurring` | Yes | Capacity bundles can be recurring add-ons. |
| List / search catalog | `GET /v1/products`, `GET /v1/prices` | Yes | Admin can sync read model on load. |
| Checkout / Customer Portal | Checkout Sessions, Billing Portal | Yes (later) | Not required for catalog CRUD; needed for licensee self-serve. |
| Coupons, tax, invoices | Separate APIs | Partial | Tax (Stripe Tax) and complex coupons often need Dashboard or extra UI — not blocking for MVO catalog. |
| Webhooks (subscription lifecycle) | `customer.subscription.*` | Yes | Required for live billing truth in LiNKaios either way. |

**Stripe constraint operators must understand:** **Prices are immutable** for amount/billing interval. Changing a list price means creating a new Price and migrating new checkouts to it (existing subscriptions keep old price until migrated).

---

## What LiNKaios Admin needs (minimum viable API integration)

1. **Governed capability lease** — `cap.stripe.product_management` (already referenced in demo capability tables) with LinkSkills run + LiNKbrain audit on each write.
2. **Server-side Stripe secret** — GSM key (e.g. `LINKTREND_AIOS_PROD_STRIPE_SECRET_KEY`); never client-side.
3. **Admin CRUD surfaces:**
   - Platform products (LiNKaios Core, capacity bundles)
   - Per-suite products (LinkSites, LiNKapps, …)
   - Price matrix per product (monthly / annual / per-seat where applicable)
4. **Local linkage table** — store `stripe_product_id`, active `stripe_price_id`(s), `suite_id` in Supabase (licensor scope) so Marketplace checkout uses stable IDs.
5. **Webhook ingestion** — subscription created/updated/canceled → licensee billing snapshot (already planned in studio forward work).

---

## Admin-owned vs mirror + Dashboard popup

| Approach | Pros | Cons |
|----------|------|------|
| **A. Admin-owned (API-first)** | Single operator UX; suite publish + Stripe linkage in one flow; audit via LinkSkills/LiNKbrain; aligns with “Capabilities not connectors” copy | Must build price-immutability UX; webhook + error handling; Stripe API versioning |
| **B. Mirror + Dashboard popup** | Faster initial ship; finance team stays in Stripe | Two sources of truth; ID copy/paste errors; no governed side-effect trail unless wrapped; poor Principal experience |
| **C. Hybrid (recommended)** | API-first for **create/link/price**; Dashboard link for **finance break-glass** only | Slightly more UI ( “Open in Stripe” on detail row ) |

**Recommendation: C (Hybrid), biased toward A for all routine work.**

Routine operations (new suite SKU, annual price, capacity bundle) → **Admin forms → Stripe API**.  
Exceptional operations (charge dispute, tax registration, manual credit note) → **Stripe Dashboard** with deep link from Admin billing row.

---

## Answer to Principal questions

### Can majority of product create / price / billing frequency be done via API from Admin?

**Yes.** Product creation, recurring interval selection, multi-price catalogs, metadata for suite mapping, and archival are all supported. The Admin UI should guide operators through price immutability (new price row vs edit-in-place).

### Admin-owned vs mirror + Stripe Dashboard popup?

**Prefer Admin-owned API management** with optional “Open in Stripe” on each product row for finance escalation. Remove the blue “billing source of truth: Stripe Dashboard” banner (done in P2) — replace with subtitle pointing to this research until API forms ship.

---

## Suggested implementation phases

| Phase | Scope | Principal gate |
|-------|--------|----------------|
| **P2 (now)** | Research memo; soften Stripe products copy; keep manual product ID mapping in suite builder | None |
| **P3** | Read-only sync — list Stripe products/prices into Admin table via API | Live Stripe read (shadow mode OK) |
| **P4** | Write path — create product + default monthly price from suite builder | Live Stripe write approval |
| **P5** | Checkout + webhooks — Marketplace uses created prices | Production billing approval |

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Price immutability confusion | UI: “Publish new price” not “Edit amount”; show active vs legacy prices |
| Accidental prod catalog change | LinkSkills lease + Principal approval on first live write; test mode key in staging |
| Drift between Admin and Stripe | Webhook + nightly reconcile job; display `last_synced_at` |
| Tax / invoicing complexity | Defer to Stripe Tax + Dashboard break-glass; document in operator help |

---

## References

- Stripe Products API: https://docs.stripe.com/api/products  
- Stripe Prices API: https://docs.stripe.com/api/prices  
- Stripe Billing — multiple prices per product: https://docs.stripe.com/products-prices/how-products-and-prices-work  
- LiNKaios capability stub: `cap.stripe.product_management` in `LiNKaios/linkaios-web/src/lib/ui-mocks/capability-connectors-demo.ts`  
- Current UI: `LiNKaios/linkaios-web/src/app/(shell)/suites/billing/page.tsx`, `licensor-suite-builder-panel.tsx`
