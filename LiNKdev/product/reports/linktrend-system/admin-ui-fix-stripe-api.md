# Admin UI fix — Stripe API integration handoff

**Date:** 2026-06-10  
**Branch:** `issue/admin-ui-fix`  
**Decision:** Admin-owned hybrid (>80% Stripe API coverage for catalog/pricing scope)

---

## 80% assessment

Stripe Products + Prices API covers **well over 80%** of LiNKaios Admin catalog/pricing needs (create/update/archive products, recurring intervals, multi-price matrices, metadata for suite linkage); tax, disputes, and complex coupons remain Dashboard break-glass.

---

## What was built

### Server (LiNKaios Admin API)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/stripe/products` | GET | List products + prices from Stripe |
| `/api/admin/stripe/products` | POST | Create product (optional `suiteId` → metadata) |
| `/api/admin/stripe/products/[productId]` | POST | Archive product (`active: false`) |
| `/api/admin/stripe/prices` | POST | Create price (amount, currency, recurring interval) |
| `/api/admin/stripe/linkage` | PATCH | Set `metadata.suite_id` on existing product |

**Auth:** Licensor operator + Admin/Super Admin (same gate as LinkGuard manual cleanup).

**Governance:** Writes wrapped with `cap.stripe.product_management` lease + audit stubs (`withStripeProductManagementGovernance`).

**Implementation:** Fetch-based Stripe REST client — no new npm dependency.

### UI

- **`/suites/billing`** (Admin + shell re-export): `StripeProductsPanel` — catalog table, create product/price forms, suite linkage dropdown, archive, **Open in Stripe** modal per row.
- **Suite builder → Stripe tab:** `StripeSuiteTab` — link existing, create & link, manual ID fallback, syncs local store via `linkStripeProduct`.
- **Removed:** Static platform product cards and blue “billing source of truth” banner (replaced with API-first subtitle).

### Local linkage

- Suite ↔ product mapping stored in Stripe product `metadata.suite_id` on write.
- Client localStorage store (`useLicensorSuiteStore`) updated on linkage for publish gating until Supabase persistence lands.

### Tests

- `src/lib/admin/stripe/stripe-admin.test.ts` — format, dashboard URL, request parsers
- `src/lib/admin/stripe/governance.test.ts` — governance wrapper

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LINKTREND_AIOS_PROD_STRIPE_SECRET_KEY` | Preferred (GSM) | Production Stripe secret (`sk_live_*` or `sk_test_*`) |
| `STRIPE_SECRET_KEY` | Fallback | Local/dev placeholder for same secret |

Use **test mode** keys in staging. Never expose secrets client-side.

---

## Verification

```bash
cd LiNKaios/linkaios-web
pnpm test src/lib/admin/stripe/
pnpm typecheck
```

With `STRIPE_SECRET_KEY=sk_test_…` set:

1. Open Admin → Suites → Stripe products (`/admin/suites/billing`).
2. Create product linked to a suite; confirm row appears and suite mapping updates.
3. Create monthly/annual price; confirm immutability note and price list.
4. Click **Stripe** on a row → break-glass modal → Open in Stripe Dashboard.
5. Suite builder → Stripe tab → create & link or select existing product.

---

## Not in this batch

- Supabase `stripe_product_id` / `stripe_price_id` persistence table
- Checkout Sessions / Customer Portal
- Webhook ingestion for subscription lifecycle
- Full LinkSkills lease persistence to Supabase / LiNKbrain write

These align with STRIPE_ADMIN_API_RESEARCH.md phases P5+.

---

## Key files

- `LiNKaios/linkaios-web/src/lib/admin/stripe/` — client, config, governance, format
- `LiNKaios/linkaios-web/src/app/api/admin/stripe/` — routes
- `LiNKaios/linkaios-web/src/components/admin/stripe-products-panel.tsx`
- `LiNKaios/linkaios-web/src/components/admin/stripe-suite-tab.tsx`
- `LiNKaios/linkaios-web/src/components/admin/stripe-open-modal.tsx`
