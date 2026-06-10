# Admin UI fix — P1 LiNKbots

**Branch:** `issue/admin-ui-fix`  
**Date:** 2026-06-10

## Summary

Consolidated Fleet v1 into **All LiNKbots**, simplified Admin nav, fixed worker session UX, and restricted worker LiNKskills toggles to runtime-only.

## Nav changes

| Before | After |
|--------|-------|
| LiNKbots → All LiNKbots | **LiNKbots → All LiNKbots** (only submenu item) |
| LiNKbots → Admin LiNKbots | **Removed** — use sidebar **View** filter (`All` / `Admin` / licensee) |
| LiNKbots → Fleet v1 | **Removed** — `/admin/fleet` redirects to `/admin/workers` |
| Page header licensee scope banner on LiNKbots | **Removed** (`hideLicensorScope`) |
| Add LiNKbot (Client header + empty state) | **Removed** — `/workers/new` redirects; overview quick action → **Open Suites** |
| Admin Add LiNKbot | **Removed** — `/admin/workers/new` redirects to Suites |

Sidebar **View** filter (`SidebarLicensorScope`) drives fleet list via `?scope=` URL param and `filterFleetAgentsForViewScope`.

## Tab merges

| Before | After |
|--------|-------|
| Sessions + Logs tabs | **Sessions only** — closed JSONL logs live under Sessions (`#session-logs`) |
| `/workers/:id/logs` | Redirects to `/workers/:id/sessions#session-logs` |
| Native UI tab (route) | **Popup** on tab click when `NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL` is set; fallback route kept |

## Fleet card fields (All LiNKbots)

Each list/grid card now shows Fleet v1 metadata line:

`{runtimeId} · {kind} · {status}`

- **runtimeId** — from `runtime_settings.linkaios_fleet.runtime_id` / `openclaw_agent_id`, role mapping, or agent UUID
- **kind** — `OpenClaw` | `Agent Zero` | `LiNKaios` (from fleet dashboard fixture map when matched)
- **status** — presence label merged with fleet fixture status when known

Source: `lib/fleet-card-meta.ts` + `lib/admin/fleet-dashboard.ts`

## Worker detail

### Breadcrumbs
- Fixed duplicate **Sessions** crumb on session detail (`enrichWorkerBreadcrumbs` index fix)
- Removed redundant inline breadcrumb under session header (AutoBreadcrumbs + `SessionBreadcrumbRegister` only)
- Session leaf crumb uses **session title** (registered label), not generic "Session"

### Session detail
- **Timeline** — fixed height (`max-h-56`), scrollable
- **Transcript** — parsed from `metadata.messages` / `transcript` / fallback JSON
- **Interaction** — tool calls from `metadata.tool_calls` (or inferred counts)

### LiNKskills tab (worker)
- **Company-wide toggles hidden** — `SkillsCatalogTable` / `ToolsCatalogTable` `runtimeOnly` mode
- Company-wide toggles remain in **LiNKskills** hub only

### LiNKbrain tab
- Unchanged wiring — `loadLinkbrainPageData` + UI mock overlay seed when mocks enabled

## Native UI URL pattern

```text
{NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL}?agent={openclawAgentId}
```

Example (OpenClaw gateway UI):

```text
https://linkbot.linktrend.internal:18789/?agent=admin-openclaw
```

- Env: `NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL`
- Agent param resolves OpenClaw profile id from `runtime_settings` when present, else LiNKaios agent UUID
- Tab click calls `openExternalPopup(href)` (`worker-subnav.tsx`)

## Key files

- `components/shell-sidebar.tsx` — nav
- `app/(shell)/workers/page.tsx` — fleet list + card meta
- `lib/fleet-card-meta.ts` — fleet merge helper
- `lib/worker-detail-tabs.ts` — removed Logs tab
- `app/(shell)/workers/[id]/sessions/page.tsx` — logs section
- `components/worker-subnav.tsx` — Native UI popup
- `lib/linkbot-native-ui.ts` — URL builder
- `lib/shell-breadcrumb-hubs.ts` — breadcrumb fix
- `components/skills-catalog-table.tsx` / `tools-catalog-table.tsx` — `runtimeOnly`

## Verification

```bash
cd LiNKaios/linkaios-web && pnpm exec tsc --noEmit
```

Manual smoke:
1. Admin → LiNKbots submenu shows **All LiNKbots** only
2. Sidebar View → Admin / licensee filters list
3. Worker → Sessions tab includes **Session logs** section
4. Session detail → scrollable timeline, transcript, tool calls
5. Native UI tab → opens popup when env set
6. Worker LiNKskills → Runtime column only (no Published/For Company)
