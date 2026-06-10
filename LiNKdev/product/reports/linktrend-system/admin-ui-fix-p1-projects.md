# Admin UI Fix — P1 Projects Handoff

**Date:** 2026-06-10  
**Branch:** `issue/admin-ui-fix`  
**AdminDB:** `ilxzgfyllipkwrgrviof`

---

## Summary

P1 Admin Projects fixes: lifecycle status model, detail UX, wizard → Draft create, suite binding, Phases RPC, Runs/Leases tabs, and AdminDB migration.

---

## DB migrations applied (AdminDB)

| Migration | Status |
|-----------|--------|
| `admin_project_p1_run_spine_brief` (remote) | **Applied** |
| `supabase/migrations/202606101200_admin_project_p1.sql` (repo) | **Committed** |

Changes:

- `linkaios.get_project_run_spine(uuid)` — recreated with grants + `NOTIFY pgrst, 'reload schema'`
- `linkaios.projects.brief` — nullable text for editable Overview brief

Verification:

```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'linkaios' AND routine_name = 'get_project_run_spine';
-- → get_project_run_spine
```

Data cleanup:

- Removed test project **Acme Chloe** (`31cff74b-cb5b-43af-925b-1c28200db3df`) and associated traces.

---

## Binding logic

| Step | Behavior |
|------|----------|
| Wizard POST | `create_project` RPC with preset `suite_id` + `module_ids` → status **draft** |
| Post-create | `bindAdminProjectSuiteTemplate()` resolves lead LiNKbot from suite template first agent executor; updates `primary_agent_id` when fleet agent matches |
| Plane | **Deferred** on create; Draft projects use **Launch project** → `POST /api/projects/{id}/plane-sync` |
| Detail meta | Suite/module labels from `admin-suite-templates` (not raw ids) |
| Phases/Issues/Agents tabs | Existing `plane-project-snapshot.ts` + admin templates |

Files:

- `LiNKaios/linkaios-web/src/lib/admin-project-suite-binding.ts`
- `LiNKaios/linkaios-web/src/lib/admin-project-create.ts`

---

## UI changes delivered

| Requirement | Status |
|-------------|--------|
| Status enum Draft \| Active \| Archived | Done — `project-status-ui.ts` |
| Remove green "Project launched" banner | Done — no `?created=1` redirect; banner removed from Admin detail |
| Status pill beside project name (header left) | Done — `ShellPageHeader.titleExtra` |
| Breadcrumb shows project name | Done — `ProjectBreadcrumbRegister` |
| Copy project ID | Done — `CopyIdButton` in meta grid |
| At-a-glance cards informational only | Done — removed `href` from lifecycle + overview snapshot grids |
| Launch/New project button styling | Done — `UiButton buttonKey="approveRow"` |
| Minimal wizard (name, suite, type) → Draft | Done — 2-step wizard; **Create project** |
| Editable project brief on Overview | Done — `ProjectBriefEditor` + PATCH API |
| Runs: project name column | Done |
| Runs: 24h / 7d / 30d / all filter (default 30d) | Done — `ProjectRunsPanelClient` |
| Remove Open System Logs from Runs tab | Done — `hideTracesLink` |
| Leases: real records (30d window) | Done — `loadLeaseStatus` time filter + project trace join |
| Remove Acme Chloe | Done — AdminDB delete |

---

## Remaining gaps

| Gap | Notes |
|-----|-------|
| **Plane status sync → Archived** | UI maps `completed`/`cancelled`/`failed` → Archived; no live Plane state pull on detail yet |
| **Lead LiNKbot UUID** | Fleet has one demo agent; template lead name shown when `primary_agent_id` unset |
| **Leases ↔ project** | Filtered via trace run_ids; leases without run linkage still hidden |
| **Client `(shell)/projects`** | Lifecycle cards use same Draft/Active/Archived model; licensee create flow unchanged |
| **Deploy** | Code on branch; DO container recycle after merge for runtime proof |
| **Pre-existing typecheck** | Unrelated failures in linksuitegen routes / session-stop-policy remain on branch |

---

## Verification commands

```bash
cd LiNKaios/linkaios-web
pnpm test src/lib/admin-project-create.test.ts src/lib/admin-projects-data.test.ts
```

---

## Key paths

- Admin list: `/admin/projects`
- Admin detail: `/admin/projects/[id]`
- Brief API: `PATCH /api/admin/projects/[id]/brief`
- Launch: `POST /api/projects/[id]/plane-sync`
