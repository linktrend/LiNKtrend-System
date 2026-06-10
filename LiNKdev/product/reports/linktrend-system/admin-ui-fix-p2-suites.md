# Admin UI Fix — P2 Suites Builder

**Date:** 2026-06-10  
**Branch:** `issue/admin-ui-fix`  
**Scope:** Full suites builder — modals, composition, tab-scoped actions

---

## Summary

P2 delivers a publishable suite composition editor in LiNKaios Admin: modal-based CRUD for modules/phases/issues, tab-scoped add buttons, input/output contracts, dependencies, concurrency rules, optional Markdown instruction upload, LiNKbot role profiles, and LiNKautowork JSON automation upload. Stripe tab remains mapping-only.

---

## Schema / model changes

### `ModuleIssueTemplate` (`modules-catalog-demo.ts`)

| Field | Type | Purpose |
|-------|------|---------|
| `dependencies` | `IssueDependency[]` | Cross-issue edges (`blocked_by`, `can_run_after`, `must_finish_before`, `can_run_in_parallel_with`) |
| `instructionMd` | `string?` | Executor guidance body from `.md` upload |
| `instructionMdFileName` | `string?` | Uploaded file name |
| Executor `roleId` | `string?` | LiNKbot role binding |
| Executor `automationJson` | `Record<string, unknown>?` | Parsed workflow JSON |

### `ModulePhaseTemplate`

| Field | Type | Purpose |
|-------|------|---------|
| `inputContract` / `outputContract` | `string?` | Phase-level contracts |
| `concurrency` | `"sequential" \| "parallel"` | Issue lane rules |
| `dependsOnPhaseIds` | `string[]?` | Phase ordering |

### `SuiteModuleTemplate`

| Field | Type | Purpose |
|-------|------|---------|
| `inputContract` / `outputContract` | `string?` | Module-level contracts |
| `dependsOnModuleIds` | `string[]?` | Module ordering |

### New module: `suite-composition.ts`

- `SuiteCompositionUpsert` discriminated union (module, phase, issue, linkbot, automation)
- `applySuiteCompositionUpsert()` — create + edit paths
- `suiteCompositionReady()` — completeness gate (all issues have input/output contracts)
- `SUITE_LINKBOT_ROLE_PRESETS` — vendor role catalogue

### Store (`use-licensor-suite-store.ts`)

- `upsertComposition(suiteId, upsert)` — modal save path with localStorage persistence

### Completeness checklist

- Added **`composition`** item — true when every issue has non-empty input and output contracts

---

## UI implemented

| Area | Change |
|------|--------|
| **Header** | Draft/Ready/Published pill via `titleExtra` beside suite name; publish actions only in actions row |
| **Modules & Phases tab** | Add Module, Add Phase, Add Issue only; edit icons on tree rows |
| **LiNKbots tab** | Add LiNKbot only; modal with issue target + role profile presets |
| **Automations tab** | Add Automation only; JSON upload + manual handle fields |
| **Stripe tab** | Product ID mapping unchanged (no API expansion) |

### Modals (`suite-builder-modals.tsx`)

- Module: name, description, optional contracts, module dependencies, continuous run flag
- Phase: parent module, contracts, concurrency, phase dependencies
- Issue: parent module/phase, contracts (required), dependency editor, `.md` upload
- LiNKbot: target issue, display name, role profile (fleet-style flow)
- Automation: target issue, JSON upload, title/handle/description

### Tree (`module-process-tree.tsx`)

- `variant="builder"` enables edit buttons
- Shows dependency summary, instruction file, phase concurrency badge

---

## Verification

```bash
cd LiNKaios/linkaios-web
pnpm test src/lib/suite-composition.test.ts src/lib/licensor-suite-catalog.test.ts
```

Manual smoke:

1. Open `/admin/suites/venture-media/builder`
2. Add Module → Add Phase → Add Issue via modals
3. Edit issue — set contracts and add dependency on prior issue
4. LiNKbots tab → Add LiNKbot bound to issue
5. Automations tab → upload JSON or enter handle
6. Confirm pill beside suite name; Stripe tab saves `prod_…` mapping only

---

## Deferred / out of scope

- Live Stripe API (separate agent)
- Server-side suite catalogue RPC (still localStorage + seed for MVO)
- LiNKbot fleet registry sync from composition save

---

## Files touched

- `LiNKaios/linkaios-web/src/lib/ui-mocks/modules-catalog-demo.ts`
- `LiNKaios/linkaios-web/src/lib/suite-composition.ts` (new)
- `LiNKaios/linkaios-web/src/lib/suite-composition.test.ts` (new)
- `LiNKaios/linkaios-web/src/lib/licensor-suite-catalog.ts`
- `LiNKaios/linkaios-web/src/hooks/use-licensor-suite-store.ts`
- `LiNKaios/linkaios-web/src/components/admin/suite-builder-modals.tsx` (new)
- `LiNKaios/linkaios-web/src/components/admin/licensor-suite-builder-panel.tsx`
- `LiNKaios/linkaios-web/src/components/suites/module-process-tree.tsx`
