# LiNKaios Admin UI — Fix Execution Plan

**Status:** Ready for orchestrator agent  
**Created:** 2026-06-08  
**Principal model:** One additional Cursor agent chat (orchestrator) delegates **sub-agents per wave**; parallelize independent tracks **within** each wave. Principal re-reviews on DO after **Wave 2** and after **Wave 6**.

---

## Source documents (read first)

| Order | Document | Purpose |
|------:|----------|---------|
| 1 | `LiNKdev/AGENTS.md` | Factory entry, git flow, agent behavior |
| 2 | `LiNKdev/product/reports/linktrend-system/ADMIN_UI_LIVE_REVIEW_2026-06-06.md` | **79 findings** — authoritative defect register |
| 3 | **This file** | Wave order, parallel tracks, acceptance gates |
| 4 | `LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md` | Admin = vendor; Client = licensee |
| 5 | `.cursor/rules/07-suite-project-terminology.mdc` | Suite / Project / Run vocabulary |
| 6 | `.cursor/rules/08-linkaios-ui-standards.mdc` | Title Case, buttons, shell patterns |

**Do not** re-litigate product decisions locked in the review doc unless Principal explicitly reopens them in chat.

---

## Locked product decisions (do not revert)

| Topic | Decision |
|-------|----------|
| **Admin vs Client** | Admin = **vendor/licensor** UI. Linktrend studio tenant ops live on **Client**, not Admin. |
| **Projects in Admin** | **No client/licensee project management.** Admin **Projects** = **admin programs** (vendor work for admin LiNKbots, Plane when applicable). Current `/admin/projects/*` Client mirrors = **bleed to replace**. |
| **LiNKbot Projects tab** | Show **only for admin LiNKbots**; **hide** when monitoring a client tenant bot. |
| **Add LiNKbot (Admin)** | **Remove** — bot roles come from **suite builder / composition** only. |
| **Company nav** | Becomes **Clients / Licensees** — registry + service profile, not Client corporate governance. |
| **LiNKbrain (Admin)** | **Shared vendor brain** — not tenant Company Memory bleed. |
| **Customer Service** | **New Admin section** required (tickets across licensees; Chatwoot capability when live). |
| **Metrics** | **Live** when `LINKAIOS_UI_MOCKS=0`; zeros = sparse deploy, not mock KPIs. Label clearly in UI. |

### Defaults where review left open questions

| Open question | Default for this plan |
|---------------|----------------------|
| LiNKsuitegen nav | Nested **inside Suites** accordion (not orphaned sibling rail) |
| Fleet v1 nav | Under **LiNKbots** submenu (not Suites) |
| Licensee route label | Keep **`/admin/licensees`**; user-facing copy **Clients / Licensees** |
| Customer Service MVO | **Nav + unified queue UI** with stub/shadow mode + `038_support_tickets.sql` prep; wire Chatwoot when `cap.chatwoot.customer_support` exists |
| Preferences / theme limits (75) | **Defer** to Wave 6 polish unless trivial |

---

## Execution model (orchestrator agent)

```
Orchestrator (single Principal-opened chat)
  │
  ├── Wave 0 ──► sub-agent A (migrations verify/apply)
  │              sub-agent B (mission_id → project_id queries)
  │              sub-agent C (leases tenant resolver)
  │              sub-agent D (alerts page / Suspense)
  │              → merge → deploy DO → acceptance Wave 0
  │
  ├── Wave 1 … Wave 6 (same pattern)
  │
  └── Final: wave-6 report + Principal re-review checklist
```

### Orchestrator rules

1. **Sequential waves** — finish Wave N acceptance before starting Wave N+1.
2. **Parallel inside wave** — spawn sub-agents only for **independent tracks** listed per wave.
3. **One PR branch** — `issue/admin-ui-fix-wave0-6` → `development` (or wave-scoped commits on same branch).
4. **Deploy after each wave** — `linkdroplet-00` LiNKaios Admin; record commit SHA in wave report.
5. **No Hetzner / Wave 12** — DigitalOcean only.
6. **Governance** — side-effecting capability work keeps lease + audit stubs per MVO contracts even in shadow mode.
7. **Write report** — `LiNKdev/product/reports/linktrend-system/admin-ui-fix-wave{N}.md` per wave with evidence (URLs, screenshots paths, test output).

### Environment assumptions

- DO Admin URL: Principal Tailscale / internal host (same as live review).
- Supabase: migrations **033 applied** on AdminDB; **011** and **022** may be **missing** (LiNKskills errors) — verify and apply in Wave 0.
- `LINKAIOS_UI_MOCKS=0` on DO for acceptance runs unless wave explicitly tests mock labeling.

---

## Finding → wave map (all 79)

| Wave | Findings closed (primary) |
|------|---------------------------|
| **0 — Unblock** | 20, 35, 48, 59, 60, 61, 62, 63, 64, 69, 70 |
| **1 — Admin boundary** | 27, 28, 40, 41, 46, 58, 1, 2, 3, 4, 68 |
| **2 — Clients + Settings** | 71, 72, 73, 74, 77, 78, 76 |
| **3 — Work + fleet ops** | 21, 22, 23, 24, 25, 26, 42, 43, 44, 45 |
| **4 — Suites (vendor core)** | 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 |
| **5 — Brain + programs + CS** | 29, 30, 31, 32, 33, 34, 65, 66, 67, 79 |
| **6 — Polish + metrics** | 36, 37, 38, 39, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 75 |

Findings may touch multiple waves; **primary wave** owns the fix. Orchestrator marks finding **closed** in wave report when acceptance passes.

---

## Wave 0 — Unblock (migrations + query alignment)

**Goal:** Every Admin section **loads without crash** on DO (empty state OK).

**Blockers addressed:** 20, 35, 48, 59–64, 69, 70

### Parallel tracks

| Track | Work | Likely files |
|-------|------|--------------|
| **0A — DB verify/apply** | Confirm `011_linkaios_tools.sql`, `022_skills_progressive_disclosure.sql` on AdminDB; apply if missing. Re-run PostgREST schema cache refresh if needed. | `services/migrations/011_*.sql`, `022_*.sql`, Supabase MCP |
| **0B — mission_id → project_id** | Grep `mission_id` in `LiNKaios/linkaios-web/` and `packages/linklogic-sdk/`; update queries/types to `project_id` post-033. | `lib/linkbrain-data.ts`, `lib/linkbrain-trace-data.ts`, alerts loaders, trace feeds |
| **0C — Leases resolver** | Replace `resolveCalusaTenantId()` throw with licensor-scoped tenant for Admin leases (Project + LiNKskills). | `lib/admin-linkskills-tenant.ts`, `components/linkskills-leases-panel.tsx`, project leases route |
| **0D — Alerts page** | Fix Server Components crash; wrap `useSearchParams` consumers in Suspense if required; align trace query with 0B. | `app/(admin-shell)/admin/work/alerts/*`, Work alerts components |

### Acceptance (Wave 0)

- [ ] `/admin/skills` Overview loads (capabilities stats or empty — no SQL error)
- [ ] `/admin/skills/skills` loads catalogue (or empty)
- [ ] `/admin/skills/tools` loads (no missing table error)
- [ ] `/admin/skills/leases` loads (no error boundary)
- [ ] `/admin/memory` Inbox + all tabs load (empty OK)
- [ ] `/admin/work/alerts` loads (no "Something Went Wrong")
- [ ] Worker detail → LiNKbrain tab loads (finding 48)
- [ ] `/admin/projects/{id}?tab=leases` loads (finding 35)
- [ ] `/admin/licensees` and licensee detail tabs load without `registeredOffice` crash (69, 70) — minimal guard acceptable in Wave 0; full UX in Wave 2

### Wave 0 report path

`LiNKdev/product/reports/linktrend-system/admin-ui-fix-wave0.md`

---

## Wave 1 — Admin / Client boundary

**Goal:** Admin shell reflects **vendor** scope; remove Client bleed and wrong affordances.

**Findings:** 27, 28, 40, 41, 46, 58, 1, 2, 3, 4, 68

### Parallel tracks

| Track | Work | Likely files |
|-------|------|--------------|
| **1A — Nav + sidebar** | Nest LiNKsuitegen inside Suites accordion; move Fleet v1 to LiNKbots; remove submenu icons (4); dedupe Add Suite sidebar (3); update `LICENSOR_NAV` / `shell-sidebar.tsx` | `shell-sidebar.tsx`, `licensor-suites-sidebar-section.tsx`, `admin-linksuitegen-sidebar.tsx`, `lib/app-roles.ts` |
| **1B — Projects gating** | Block Client project CRUD mirror on Admin; introduce **Admin Programs** list stub (empty state + copy) OR feature-flag old routes to redirect; Plane arrow → popup pattern stub | `(admin-shell)/admin/projects/*`, `projects-index-table.tsx`, `lib/app-roles.ts` |
| **1C — LiNKbots boundary** | Remove **Add LiNKbot** route/button on Admin (41); fleet list copy clarifies vendor monitor (40); **Projects tab** on worker detail hidden unless `isAdminBot(agent)` (46) | `workers/page.tsx`, `workers/new/*`, `worker-subnav.tsx`, `lib/worker-detail-tabs.ts` |
| **1D — Licensees label** | Sidebar/header copy **Clients / Licensees** (68); no functional registry rewrite yet | `shell-sidebar.tsx`, `company-page-copy.ts` |

### Acceptance (Wave 1)

- [ ] No orphaned LiNKsuitegen / Fleet v1 rail outside Suites accordion
- [ ] Fleet v1 reachable under LiNKbots (or documented redirect)
- [ ] Admin `/admin/workers/new` removed or 404 with message "Use Suite builder"
- [ ] Client tenant bot detail: **no Projects tab**
- [ ] Admin bot detail: **Projects tab present**
- [ ] `/admin/projects` shows admin-programs intent (not Client wizard bleed) — stub OK
- [ ] Submenu links text-only (no Plus/Factory icons)

### Principal checkpoint

**Stop for Principal DO smoke after Wave 1** optional; **required after Wave 2**.

---

## Wave 2 — Clients / Licensees + Settings (Admin-scoped)

**Goal:** Licensee registry usable; Settings match licensor operator role.

**Findings:** 68 (complete), 69, 70, 71, 72, 73, 74, 76, 77, 78

### Parallel tracks

| Track | Work | Likely files |
|-------|------|--------------|
| **2A — Licensees registry** | Replace Client Company/Brand panels on Admin with licensor overview; guard `registeredOffice`; operational fields only | `admin-company-page.tsx`, `licensor-licensee-*`, `company-overview-panel.tsx` |
| **2B — Settings Account** | Hide delete account, plan/billing, support when `isAdmin` / licensor (71); rework workspace access card for platform scope (72) | `settings-hub.tsx`, `operator-workspace-access-card.tsx` |
| **2C — Settings Security** | Gate roles UI by permission; implement create-user-then-invite flow (73); label 2FA as demo until QR live (74) | `settings/access/*`, Supabase admin API |
| **2D — Settings Data + Platform** | Hide licensee Integrations card on Admin (77); ensure Platform tab visible for Super Admin (78); keep Data export direction (76) | `settings-hub-tabs.ts`, `settings-hub.tsx`, `platform-panel.tsx` |

### Acceptance (Wave 2)

- [ ] `/admin/licensees` — browse licensees, open detail, no crash on Overview or Companies index
- [ ] Admin Settings Account: profile only — no delete, billing, support
- [ ] Super Admin sees Platform tab in Settings
- [ ] No Integrations request card on Admin
- [ ] Add member flow documented or implemented per 73 (invite + password change — shadow OK with audit)

### Principal checkpoint — **required**

Principal re-reviews Admin on DO: nav, licensees, settings, LiNKskills/LiNKbrain load state.

---

## Wave 3 — Work + LiNKbots operator UX

**Goal:** Work section and bot session monitoring match operator expectations.

**Findings:** 21–26, 42–45

### Parallel tracks

| Track | Work | Likely files |
|-------|------|--------------|
| **3A — Action queue** | Replace raw JSON trace dump with human-readable action items (title, tenant, suite, CTA) | Work hub, `buildAttentionFeed`, trace mappers |
| **3B — Messages** | Hide Slack/Telegram when not configured (22); fix Zulip deep link → new tab/popup to Zulip app URL (24); demote fixtures when live (23) | Messages tabs, `buildZulipThreadUrl`, env `ZULIP_SITE_URL` |
| **3C — Sessions (Work)** | View + Cancel icons all rows; Cancel disabled when completed (25); column widths (26) | Work sessions table components |
| **3D — Sessions (Worker)** | Same action column rules (42); status badge/pill (43); remove ID chevron (44); Native UI link only if session-scoped else move to tab (45) | Worker session detail components |

### Acceptance (Wave 3)

- [ ] Action queue rows readable without raw JSON payload
- [ ] Messages: Zulip only (or install CTA) when Slack/Telegram unset
- [ ] "Open in Zulip" opens Zulip web app (not Settings)
- [ ] Sessions tables: View + Cancel on every row; disabled Cancel when not running
- [ ] Session detail: status pill; no chevron-only ID reveal

---

## Wave 4 — Suites (vendor core)

**Goal:** Suite catalogue and builder are **real** vendor workflows — not mock scaffold.

**Findings:** 5–19 (Suites section)

**Note:** Largest wave. Orchestrator may split into **4a** (nav/UX/table) and **4b** (composition editor + Stripe) if time-boxing; still one wave number for reporting.

### Parallel tracks

| Track | Work | Likely files |
|-------|------|--------------|
| **4A — Builder actions** | Wire Add Module/Phase/Issue/LiNKbot/Automation (remove `BUILDER_STUB_ACTIONS` no-ops) with persistence | `licensor-suite-builder-panel.tsx`, suite API/RPC |
| **4B — Builder tabs** | LiNKbots + Automations tabs list roles/workflows; Stripe dedicated tab (13); composition bar clarity (12) | Same + Stripe integration surface |
| **4C — Lifecycle + list** | Table Edit/Publish/Unpublish/Suspend (18); Mark ready UX (14); remove redundant "Live in marketplace" (9) | `licensor-suites-index.tsx`, builder header |
| **4D — Shell polish** | Double header (6); yellow debug strip removal (7); Title Case (15–17); Stripe sidebar vs tab (5) | Shell layout, builder |

### Acceptance (Wave 4)

- [ ] Add Module/Phase/Issue/LiNKbot/Automation persist and appear in tree
- [ ] LiNKbots + Automations tabs show real rows for a suite with composition
- [ ] Suite list: Edit, Publish, Unpublish/Suspend work (or governed stub with audit)
- [ ] Mark ready / Publish gates documented in UI
- [ ] No "Mock — composition editor not wired yet" tooltips on primary actions

---

## Wave 5 — Admin programs, LiNKbrain scope, Customer Service

**Goal:** Repurposed Projects, vendor brain, and CS nav.

**Findings:** 29–34, 65, 66, 67, 79

### Parallel tracks

| Track | Work | Likely files |
|-------|------|--------------|
| **5A — Admin programs** | Launch wizard works (29); admin program detail tabs populated from Plane/sync stub; Draft badge explained or removed (30); channels/Zulip single button (32) | `new-project-wizard.tsx`, admin programs API |
| **5B — LiNKbrain Admin** | Tab set for vendor shared brain (65); Add Knowledge → collective inbox (66); Audit live/fixture label (67) | `linkbrain-tab-nav.tsx`, `memory-page-content.tsx`, `collective-linkbrain.ts` |
| **5C — Customer Service** | New nav section; unified ticket queue; shadow mode + migration 038 prep; link from Work when ready (79) | New routes, `lib/support-tickets.ts`, nav config |

### Acceptance (Wave 5)

- [ ] Launch admin program completes without internal server error
- [ ] Admin LiNKbrain tabs match vendor scope (no Client Company Memory bleed)
- [ ] Customer Service nav exists with queue UI (live or labeled shadow)
- [ ] Project detail meta cards: ID typography (31) — can move to Wave 6 if needed

---

## Wave 6 — Polish, metrics, worker detail cleanup

**Goal:** UI standards, metrics clarity, low-priority worker/settings tweaks.

**Findings:** 36–39, 47, 49–57, 75

### Parallel tracks

| Track | Work |
|-------|------|
| **6A — Metrics** | Empty-state copy ("No traces in range"); live vs mock badge; fix Cost fixture labeling (38) |
| **6B — Title Case sweep** | Admin strings per `08-linkaios-ui-standards.mdc` |
| **6C — Worker Models/Settings** | Save button align right (50); token cap step 10k (52); org profile required (54); Logs vs Sessions dedupe (55); Lifecycle → Settings footer (56) |
| **6D — Deferred** | Preferences presets (75); font pass (57) — only if time permits |

### Acceptance (Wave 6)

- [ ] Metrics dashboard explains zeros
- [ ] Title Case on touched Admin surfaces
- [ ] Models tab: caps increment 10,000; Save aligned right
- [ ] LiNKskills toggles verified or labeled shadow (47)

### Final Principal re-review

Full Admin walkthrough against `ADMIN_UI_LIVE_REVIEW_2026-06-06.md` checklist; mark findings closed or carry forward.

---

## Orchestrator kickoff prompt (copy for Principal)

Use this when opening the **single execution agent chat**:

```
Execute LiNKaios Admin UI Fix Plan — Waves 0–6.

Read first (order):
1. LiNKdev/AGENTS.md
2. LiNKdev/product/reports/linktrend-system/ADMIN_UI_LIVE_REVIEW_2026-06-06.md
3. LiNKdev/product/reports/linktrend-system/ADMIN_UI_FIX_PLAN.md

Mode: Multitask — you are the orchestrator. For each wave:
- Spawn parallel sub-agents per track table in the fix plan
- Merge, test, deploy to linkdroplet-00 LiNKaios Admin
- Write LiNKdev/product/reports/linktrend-system/admin-ui-fix-wave{N}.md with evidence
- Do not start wave N+1 until wave N acceptance passes

Branch: issue/admin-ui-fix from development
Do not push to staging/main
LINKAIOS_UI_MOCKS=0 for acceptance

Stop for Principal after Wave 2 completion and report URLs + blockers.

Locked decisions: see ADMIN_UI_FIX_PLAN.md "Locked product decisions"
```

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Wave 4 (Suites) exceeds one session | Split 4a/4b; ship persistence before Stripe API |
| Migration drift DO vs local | Wave 0A verifies via Supabase MCP before code fixes |
| Client regression from shared `(shell)` components | Add `isAdminShell` guards; run Client smoke on shared components |
| Chatwoot not deployed | Wave 5C shadow queue + migration 038; no fake "live" tickets |
| Plane popup blocked by browser | Use `window.open` with Tailscale Plane URL; document Principal network requirement |

---

## Definition of done (whole plan)

- [ ] All **79** findings marked closed or explicitly deferred with Principal approval in final wave report
- [ ] DO Admin deploy at known commit; `LINKAIOS_UI_MOCKS=0`
- [ ] No blocker-severity finding open on DO smoke
- [ ] Wave reports 0–6 committed under `LiNKdev/product/reports/linktrend-system/`
- [ ] PR to `development` with summary linking review doc + fix plan

---

*Companion to `ADMIN_UI_LIVE_REVIEW_2026-06-06.md`. No application code in this document.*
