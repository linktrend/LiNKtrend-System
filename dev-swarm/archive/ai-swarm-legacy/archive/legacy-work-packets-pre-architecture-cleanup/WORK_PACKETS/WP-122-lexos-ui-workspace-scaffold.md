# WP-122 - LEXOS UI Workspace Scaffold

## Objective

Create the foundational UI workspace scaffold for the LEXOS vertical plugin in LiNKaios, establishing the directory structure, base layout components, and route handlers for the litigation workspaces.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-122-lexos-ui-workspace-scaffold`
- Base: `origin/development`

## Allowed Files

- `plugins/vertical/lexos/ui/**/*.tsx`
- `plugins/vertical/lexos/ui/**/*.ts`
- `plugins/vertical/lexos/ui/**/*.css`
- `plugins/vertical/lexos/manifest.yaml`
- `.ai-swarm/WORK_PACKETS/WP-122*.md`
- `.ai-swarm/AGENT_REPORTS/WP-122*.md`
- `.ai-swarm/DECISIONS.md`

## Prohibited Files

- No actual LEXOS application code from `/Users/linktrend/Projects/LiNKtrend-LEXOS`
- No business logic implementation
- No data fetching or mutations
- No integration with external services

## Required Context

- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `plugins/vertical/linkapps/manifest.yaml` (reference pattern)

## Steps

1. Create plugin directory structure:
   - `plugins/vertical/lexos/ui/layouts/` — Layout components
   - `plugins/vertical/lexos/ui/components/` — Shared UI components
   - `plugins/vertical/lexos/ui/workspaces/` — Workspace panels
   - `plugins/vertical/lexos/ui/hooks/` — React hooks
   - `plugins/vertical/lexos/ui/types/` — UI-specific types

2. Create base layout components:
   - `LexosAppShell` — Main application shell
   - `MatterSubnav` — Matter-level navigation
   - `Breadcrumbs` — Navigation breadcrumbs
   - `WorkspaceContainer` — Consistent workspace wrapper

3. Create workspace panel placeholders:
   - `MatterOverviewPanel`
   - `StoryWorkspacePanel`
   - `EvidenceWorkspacePanel`
   - `AssertionsWorkspacePanel`
   - `StrategyWorkspacePanel`
   - `ResearchWorkspacePanel`
   - `ArgumentWorkspacePanel`
   - `AdversarialWorkspacePanel`
   - `OutputWorkspacePanel`
   - `IntakeWorkspacePanel`

4. Create plugin manifest:
   - `manifest.yaml` with UI panel declarations

5. Create stub route handlers:
   - Route definitions for all matter workspaces
   - Route definitions for intake and client panels

6. Update DECISIONS.md with scaffold approach

## Acceptance Criteria

- [ ] Plugin directory structure exists
- [ ] Base layout components have skeleton implementations
- [ ] All 10 workspace panels have placeholder components
- [ ] Plugin manifest declares UI panels
- [ ] Route handlers defined for all panels
- [ ] No business logic or data fetching implemented
- [ ] Components use TypeScript with proper typing

## Proof Required

- File listing of created structure
- Component source for base layouts
- Manifest content showing panel declarations
- Route handler definitions
- Branch and commit SHA
