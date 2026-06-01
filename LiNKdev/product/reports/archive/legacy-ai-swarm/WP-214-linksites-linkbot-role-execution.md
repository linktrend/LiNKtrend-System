# WP-214 — LinkSites LiNKbot Role Execution — Agent Report

## Summary

Implemented LinkSites LiNKbot role execution wiring per CONTRACTS_MVO.md §0.A.4. Added role definitions, manifest declarations, and runtime integration for the four LinkSites roles (2 enabled in MVO, 2 disabled). All acceptance criteria met with passing tests.

## Worktree / Branch

- Worktree: `/Users/linktrend/Projects/LiNKtrend-System/.worktrees/WP-214-linksites-linkbot-role-execution`
- Branch: `wp-214-linksites-linkbot-role-execution`
- Commit: `8ba626e`

## Files Changed

| Path | Change |
|------|--------|
| `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/manifest.ts` | Added `required_linkbot_roles`, `plugin_kind`, `modes_supported`, role mapping helpers |
| `LiNKbot/roles/modules/linksites/README.md` | Created - role documentation |
| `LiNKbot/roles/modules/linksites/roles.ts` | Created - role definitions with MVO enabled/disabled flags |
| `LiNKbot/roles/modules/linksites/index.ts` | Created - role exports |
| `LiNKbot/runtime-adapters/openclaw/bot-runtime/src/reasoning-dispatch.ts` | Updated `roleForReasoning` and `successActionsForReasoning` to handle LinkSites v2 roles |
| `LiNKbot/runtime-adapters/openclaw/bot-runtime/src/linksites-role-execution.test.ts` | Created - role execution tests (12 tests) |
| `modules/linksites/index.ts` | Updated exports |
| `modules/linksites/manifest.ts` | Updated re-exports |
| `modules/linksites/roles.ts` | Created - module-level role exports |

## Role Definitions (CONTRACTS_MVO.md §0.A.4)

### Enabled in MVO

| Role | Purpose | Stages |
|------|---------|--------|
| `research_enrichment_bot` | Governed public research + provenance | `linksites.research.enrich` |
| `website_builder_bot` | Template-guided website package generation | `linksites.template_select_package` |

### Disabled in MVO

| Role | Restriction |
|------|-------------|
| `lead_scout_bot` | `disabled_in_mvo`, `mock_input_only`, `no_live_acquisition` |
| `outreach_bot` | `disabled_in_mvo`, `no_outreach_draft`, `no_outreach_send` |

## Commands Run

```bash
# Typecheck
pnpm --filter @linktrend/bot-runtime typecheck
# Result: PASS

# Tests
pnpm --filter @linktrend/bot-runtime test
# Result: 48 tests passed (4 test files)
# - src/linkskills-runtime-adapter.test.ts (3 tests)
# - src/reasoning-dispatch.test.ts (29 tests)
# - src/linksites-role-execution.test.ts (12 tests)
# - src/openclaw-handoff.test.ts (4 tests)
```

## Acceptance Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| LinkSites run includes LiNKbot role/session refs | ✓ PASS | `linksites-role-execution.test.ts` validates role.started/role.completed events with role_id |
| Role outputs feed downstream stages | ✓ PASS | `research_enrichment` outputs `lead_research_bundle`, `website_package_generation` outputs `website_package` |
| Disabled roles cannot execute in MVO | ✓ PASS | `validateRoleExecution()` returns `{ valid: false }` for lead_scout_bot and outreach_bot |

## Key Implementation Details

### Role Mapping
```typescript
function roleForReasoning(kind: ReasoningKind): "research_enrichment_bot" | "website_builder_bot" {
  switch (kind) {
    case "lead_evaluation":
    case "research_enrichment":
      return "research_enrichment_bot";
    case "template_selection":
    case "copy_generation":
    case "media_placement":
    case "website_package_generation":
      return "website_builder_bot";
  }
}
```

### Audit Event Emission
Every role execution emits (per §4.5, §6.3):
- `stage.started`
- `role.started` (with `role_id`)
- Domain actions (`research.performed`, `website.package.generated`, etc.)
- `role.completed`
- `stage.completed`

### MVO Enforcement
```typescript
export function isRoleDisabledInMvo(roleId: LinkSitesRoleId): boolean {
  return LINKSITES_MVO_DISABLED_ROLES.includes(roleId);
}

export function validateRoleExecution(roleId: LinkSitesRoleId):
  | { valid: true; role: LiNKbotRoleAttachment }
  | { valid: false; reason: string } {
  // Returns valid=false for disabled roles
}
```

## Blockers

None. All blockers resolved.

## Next Step

1. Push branch to GitHub: `git push -u origin wp-214-linksites-linkbot-role-execution`
2. Integrator review and merge to `development`
3. Proceed to WP-215 (LinkSites LinkBrain Trace Proof) or WP-216 (LinkAIos Cockpit Proof Surface)
