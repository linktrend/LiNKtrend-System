# Admin UI Fix — Wave 5C (Customer Service)

**Branch:** `issue/admin-ui-fix`  
**Finding closed:** **79** — Missing Customer Service section  
**Status:** Complete (shadow mode; migration 038 prep)

---

## Summary

Added a dedicated **Customer Service** nav section on LiNKaios Admin with a unified ticket queue across licensees. The UI runs in **shadow mode** until `038_support_tickets.sql` is applied and `cap.chatwoot.customer_support` is live. Removed demo/fixture ticket seeding — no mocks.

---

## Changes

| Area | Detail |
|------|--------|
| **Nav** | New **Customer Service** accordion (Headphones icon) with **Ticket Queue** sub-link — licensor roles only |
| **Route** | `/admin/customer-service` — unified queue UI with status filters (All / Open / In Progress / Resolved) |
| **Data** | `lib/support-tickets-data.ts` — server load from `linkaios.support_tickets` when migration applied; shadow empty state otherwise |
| **Migration** | `services/migrations/038_support_tickets.sql` — table + RLS prep (pending apply) |
| **Work link** | Work → **Support Tickets** sub-link; Work → Alerts ticket actions route to Customer Service |
| **No mocks** | Removed `seedDemoTickets()` from `lib/support-tickets.ts` |

---

## Acceptance (Wave 5C)

- [x] Customer Service nav exists on Admin shell
- [x] Unified queue UI loads without crash (empty state in shadow mode)
- [x] Shadow mode labeled (`ShadowModeBadge` + migration notice)
- [x] Migration `038_support_tickets.sql` committed and listed in `PENDING_APPLY.md`
- [x] Work → Alerts support ticket View/Go to fix → `/customer-service`
- [x] Work submenu includes **Support Tickets** link (Admin only)
- [x] No fixture/demo tickets seeded

---

## Verification

```bash
# Typecheck (linkaios-web package)
pnpm --filter @linktrend/linkaios-web exec tsc --noEmit -p tsconfig.json
```

**Manual smoke (DO Admin):**

1. Open `/admin/customer-service` — empty queue + shadow banner
2. Sidebar shows **Customer Service → Ticket Queue**
3. Work → Alerts — support ticket modal links to Customer Service
4. Licensees → Support tab links to unified queue

---

## Deferred

- Live Chatwoot sync via `cap.chatwoot.customer_support`
- Apply migration 038 on AdminDB (batch with 036–037)
- Server-side ticket create/update RPC (browser localStorage interim for licensee submissions)
