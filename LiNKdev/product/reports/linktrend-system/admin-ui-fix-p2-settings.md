# Admin UI Fix — P2 Settings (Platform + Stripe research)

**Date:** 2026-06-10  
**Branch:** `issue/admin-ui-fix`  
**Scope:** Settings → Platform tab, LiNKguard detail page, Stripe products screen, Stripe API research memo

---

## Completed

### Platform tab

| Item | Action | Evidence |
|------|--------|----------|
| MVO Proof Surfaces card | **Removed** from `platform-panel.tsx` | Card no longer listed on Platform hub |
| MVO proof on Admin home | **Removed** `MvoProofCard` from `admin/page.tsx` | Admin overview no longer shows MVO proof banner |
| Smart Dev mode | **Already absent** on live Admin toolbar | `shell-chrome-toolbar.tsx` no longer renders Client/Admin switch or role-preview dropdown (removed in prior wave). No separate “Smart Dev” card existed on Platform tab — those controls were dev-review toolbar affordances. |
| Integration routing | **Kept** — renamed and clarified | See determination below |
| LiNKguard | **4-card layout implemented** | See below |

### Integration routing determination

**Keep** — operators need this for production troubleshooting.

**What the code actually does** (`gateway-dashboard.tsx`):

- Reads `gateway.stream_routing` — maps Zulip stream IDs → LiNKaios project IDs (`mission_id` column, legacy name).
- Reads `gateway.zulip_message_links` — recent inbound message links (stream, topic, project).
- Read-only diagnostic tables; no configuration writes from this screen.

**Why keep:** When Zulip messages land in the wrong stream or a project stream was never provisioned, this is the first place to correlate chat traffic with LiNKaios projects. Removing it would force operators into raw Supabase or logs.

**UI changes:**

- Platform card title: **Zulip stream routing** (was “Integration Routing”)
- Plain-English description on card and gateway page header
- `shell-page-meta.ts` subtitles updated

### LiNKguard 4-card layout

**Page:** `/admin/settings/linkguard`

| Card | Behavior |
|------|----------|
| Last heartbeat | Latest `sidecar_heartbeat` event age |
| Cleanup failures (24h) | Count of `fs_cleanup_failed` — **red metric** when > 0 |
| Latest cleanup success | Latest `residue_sweep_ack`, `bot_session_cleanup`, or `manual_cleanup_run` — **green “Clean now”** badge when no 24h failures |
| Run cleanup now | Button calls `POST /api/admin/linkguard/run-cleanup` — **licensor Admin + Super Admin only** (`canRunLinkguardCleanup`) |

**New files:**

- `src/lib/linkguard-cleanup-actions.ts` — success action vocabulary
- `src/lib/linkguard-run-cleanup.ts` — server-side sweep + audit event
- `src/app/api/admin/linkguard/run-cleanup/route.ts` — gated API
- `src/components/linkguard-run-cleanup-button.tsx` — client trigger
- `src/components/linkguard-settings-panel.tsx` — 4-card grid

### Stripe

| Item | Action |
|------|--------|
| Research memo | `STRIPE_ADMIN_API_RESEARCH.md` |
| Blue “billing source of truth” info card | **Removed** from `suites/billing/page.tsx` |
| Page subtitle | Softened — points to research memo until API forms ship |

---

## Principal decision requested

Read **`STRIPE_ADMIN_API_RESEARCH.md`**.

**Recommendation:** Admin-owned API management (hybrid) — routine product/price/frequency via Admin + LinkSkills-governed Stripe API; Stripe Dashboard as break-glass only.

---

## Verification

```bash
cd LiNKaios/linkaios-web && pnpm typecheck
```

Manual:

1. `/admin/settings?tab=platform` — three cards only (routing, traces, LiNKguard); no MVO proof
2. `/admin` — no MVO proof card on overview
3. `/admin/settings/linkguard` — four metric cards; Run cleanup disabled for licensor User tier (role preview in dev only)
4. `/admin/suites/billing` — no blue Stripe banner

---

## Not in scope (P2)

- Stripe API write implementation (P3+ per research memo)
- Removing `/devtools/mvo-proof` route entirely (only removed from live Admin surfaces)
- LiNKguard User-tier permission matrix copy update (code gate is correct; matrix row still says Super Admin only for “platform owner controls” — acceptable drift until permissions page wave)
