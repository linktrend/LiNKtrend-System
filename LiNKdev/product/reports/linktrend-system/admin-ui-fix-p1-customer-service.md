# Admin UI Fix — P1 Customer Service Redesign

**Branch:** `issue/admin-ui-fix`  
**Date:** 2026-06-10  
**Model:** Chatwoot is where work happens; Admin is dashboard mirror.

---

## Summary

Customer Service queue is now a read-only mirror of Chatwoot. Operators scope tickets via the sidebar **Licensee** view, open conversations in Chatwoot popups, and never mutate ticket status from Admin.

---

## Fixes delivered

| # | Fix | Status |
|---|-----|--------|
| 1 | Remove redundant intro paragraph under Ticket Queue title | **Done** — removed capability/backend prose; kept scoped open-count line |
| 2 | Filter tickets by sidebar Licensee view | **Done** — `useLicensorScope()` filters queue client-side; Harbor Dental (`harbor-dental`) shows only that licensee |
| 3 | Start Work → Chatwoot popup | **Done** — `openExternalPopup` with conversation deep link |
| 4 | Remove Resolve from Admin | **Done** — no local status mutations in queue or licensee Support tab |
| 5 | Read-only status badges | **Done** — `DomainStatusPill` display only; status synced from Chatwoot |
| 6 | Live Chatwoot sync | **Already wired** — `CHATWOOT_SUPPORT_SYNC_MODE=live` + `support_tickets` on page load |

---

## Sync behavior

On each `/admin/customer-service` server render:

1. `loadSupportTicketsFromDb()` reads `linkaios.support_tickets`.
2. When `CHATWOOT_SUPPORT_SYNC_MODE=live` and API env is complete, `syncChatwootConversationsToDb()` runs:
   - Lists inbox conversations from Chatwoot API (`CHATWOOT_BASE_URL` — often internal Docker HTTP).
   - Upserts rows by `external_ref` (Chatwoot conversation id).
   - Maps Chatwoot status → Admin status (`open` / `in_progress` / `resolved`).
   - Sets `licensee_id` from conversation `custom_attributes.licensee_id`.
3. Page reload reflects Chatwoot truth — Admin does not write status back.

**Env (DO):**

| Variable | Role |
|----------|------|
| `CHATWOOT_SUPPORT_SYNC_MODE=live` | Enables sync |
| `CHATWOOT_BASE_URL` | Server API (e.g. `http://chatwoot-rails-1:3000`) |
| `CHATWOOT_PUBLIC_URL` | Operator browser origin (`https://chatwoot.linktrend.internal`) |
| `CHATWOOT_ACCOUNT_ID` | Account segment in popup URL |
| `CHATWOOT_API_ACCESS_TOKEN` | API auth |
| `CHATWOOT_INBOX_ID` | Inbox filter for list |

---

## Popup URL pattern

```
{CHATWOOT_PUBLIC_URL}/app/accounts/{CHATWOOT_ACCOUNT_ID}/conversations/{external_ref}
```

**Example:**

```
https://chatwoot.linktrend.internal/app/accounts/1/conversations/42
```

- `external_ref` = Chatwoot conversation id stored on `support_tickets.external_ref`.
- Built by `buildChatwootConversationUrl()` in `lib/chatwoot-links.ts`.
- Opened via `openExternalPopup()` (same pattern as Zulip).

---

## Files changed

| File | Change |
|------|--------|
| `components/customer-service/customer-service-queue.tsx` | Mirror UX, scope filter, Chatwoot popup, no Resolve |
| `app/(shell)/customer-service/page.tsx` | Pass Chatwoot operator config |
| `lib/chatwoot-links.ts` | URL builder + public origin resolver |
| `lib/chatwoot-operator-config.server.ts` | Server env helper |
| `lib/chatwoot-links.test.ts` | URL tests |
| `components/licensor/licensor-licensee-support-panel.tsx` | Same mirror rules on licensee Support tab |
| `packages/shared-config` | `CHATWOOT_PUBLIC_URL` |
| `.env.example`, `deploy/prod/.env.example` | Document public URL |

---

## Verification

```bash
pnpm --filter @linktrend/linkaios-web exec vitest run src/lib/chatwoot-links.test.ts
pnpm --filter @linktrend/linkaios-web exec tsc --noEmit -p tsconfig.json
```

**Manual smoke:**

1. Sidebar **Licensee** → **Harbor Dental Co-op** → Customer Service shows only `harbor-dental` tickets.
2. **All licensees** → full queue.
3. **Start Work** opens `https://chatwoot.linktrend.internal/app/accounts/1/conversations/{id}`.
4. No Resolve button; status pills are not clickable.
5. Resolve in Chatwoot → refresh Admin → badge updates after sync.
