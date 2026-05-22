# PWR-W3-B — Terminology Wave 5

- **Branch:** `dev/pwr-w3-b-terminology`
- **Base:** `origin/development`
- **IDE:** Cursor (subagent)

## Objective

Final user-facing terminology pass per `.cursor/rules/12-suite-project-terminology.mdc`. Copy only in `LiNKaios/linkaios-web/src/**`. No backend Mission rename (Wave 6).

## Changes

| Area | Fix |
|------|-----|
| Permissions / export / sessions | "run missions" → projects; export scope label; session metadata hint |
| LiNKautowork / n8n UI | Integration name LiNKautowork; automation gateway label; API key warning |
| Plane overview | "Active cycle" → Active run; description uses runs |
| Fixtures | Phase/automation names in module catalogue; mission_id in contract → project_id; demo phase name without "cycle" |
| Linkbrain / Linkapps | Phase memory (planned); automation status panel |
| Breadcrumbs | Default segment `connectors` → Capabilities |

**Files touched (18):**

- `LiNKaios/linkaios-web/src/lib/permissions-page-copy.ts`
- `LiNKaios/linkaios-web/src/app/(shell)/workers/[id]/sessions/[sessionId]/page.tsx`
- `LiNKaios/linkaios-web/src/lib/data-export-preferences.ts`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/skills-tools-catalog-demo.ts`
- `LiNKaios/linkaios-web/src/components/linkbrain/linkbrain-workspace-footer.tsx`
- `LiNKaios/linkaios-web/src/components/linkapps/linkapps-workflow-status-panel.tsx`
- `LiNKaios/linkaios-web/src/lib/integration-secret-presets.ts`
- `LiNKaios/linkaios-web/src/lib/integration-requests.ts`
- `LiNKaios/linkaios-web/src/components/settings/api-keys-panel.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/linkapps/factory/page.tsx`
- `LiNKaios/linkaios-web/src/components/project-plane-overview-section.tsx`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/missions-fixtures.ts`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/modules-catalog-business.ts`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/channel-threads.ts`
- `LiNKaios/linkaios-web/src/app/(shell)/devtools/mvo-proof/page.tsx`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/modules-catalog-demo.ts`
- `LiNKaios/linkaios-web/src/lib/company-fixtures.ts`
- `LiNKaios/linkaios-web/src/components/auto-breadcrumbs.tsx`

## Proof

### Typecheck

```bash
cd LiNKaios/linkaios-web && npm run typecheck
# exit 0
```

### Grep audit (`rg -i mission` app + components)

**User-visible Mission strings:** none remaining in shell UI copy (verified targeted greps for known stragglers).

**Documented exceptions (allowed — not user-facing labels):**

- Code identifiers: `missionId`, `mission_id`, `getMissionById`, `MissionRecord`, `LiveMissionTabs`, file names `mission-tools-*`
- URL/query legacy: `?mission=`, `b_mission`, scope value `mission` with label "Project" / "Project memory"
- DB/API: `.from("missions")`, `org_missionless_default_tools`
- Internal keys: `notification-preferences` id `mission_updates` (label already "Project updates")
- Tab normalization: `tab === "missions"` → `project` in help/memory nav
- Breadcrumb map key `missions: "Projects"` (route segment alias)
- Tool registry id `mission_board` (internal name; description says project board)
- Devtools proof field names `workflow_run_ids` (label now "Automation refs")

**Connector / n8n / workflow UI:**

- No user-visible "Connectors", "n8n", "Workflow gateway", or "Workflow status" in `src/app` + `src/components`
- Metrics scope filter internal key `workflow` maps to label **Phase** (unchanged, correct)

## Commit

```
chore(ui): terminology wave 5 stragglers
```

**SHA:** `113c36855741ff14ab40a87a098c4c2b736cfd1d`

## Blockers

None.

## Next step

- Integrator: merge `dev/pwr-w3-b-terminology` → `development`
- Wave 6 (PWR-W3-C or dedicated packet): backend `MissionRecord` / DB / RPC rename per migration phases C/D
