# WP-122: LEXOS UI Workspace Scaffold

## Your Assignment

Create the foundational UI workspace scaffold for the LEXOS (Litigation) vertical plugin in LiNKaios. This is the first UI packet for LEXOS — you are establishing directory structure, base layout components, and workspace panel placeholders.

## Before You Start

Read these files in order:
1. `.cursor/rules/00-linktrend-master-rule.mdc`
2. `.cursor/rules/01-ecosystem-boundaries.mdc`
3. `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` — Section 7 (LiNKaios UI Panels)
4. `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md` — UI panel architecture
5. `plugins/vertical/linkapps/manifest.yaml` — Reference pattern

## Work Packet

**Packet:** `.ai-swarm/WORK_PACKETS/WP-122-lexos-ui-workspace-scaffold.md`

## Clean Worktree Launch

Create and use an isolated worktree for this packet:

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin
git worktree add ../LiNKtrend-System-WP122 dev/cursor/WP-122-lexos-ui-workspace-scaffold 2>/dev/null || git worktree add ../LiNKtrend-System-WP122 origin/development
cd ../LiNKtrend-System-WP122
git checkout -b dev/cursor/WP-122-lexos-ui-workspace-scaffold
```

Verify clean status before editing:
```bash
git status --short --branch
```

If you see unrelated dirty files, stop and report the blocker.

## What To Build

### 1. Plugin Directory Structure

Create under `plugins/vertical/lexos/ui/`:
```
plugins/vertical/lexos/
├── ui/
│   ├── layouts/          # Layout components
│   ├── components/       # Shared UI components
│   ├── workspaces/       # Workspace panels
│   ├── hooks/            # React hooks
│   └── types/            # UI-specific types
├── manifest.yaml         # Plugin manifest
└── README.md             # Plugin documentation
```

### 2. Base Layout Components

Create these skeleton components in `ui/layouts/`:

**LexosAppShell.tsx**
- Main application shell for LEXOS
- Props: `children`, `matterId?`, `activePanel?`
- Returns: Shell with header, optional matter subnav, content area

**MatterSubnav.tsx**
- Navigation for matter-specific panels
- Props: `matterId`, `activeStage`
- Returns: Vertical or horizontal nav with W0-W11 stage links

**Breadcrumbs.tsx**
- Navigation breadcrumbs
- Props: `items: {label, href}[]`
- Returns: Breadcrumb trail

**WorkspaceContainer.tsx**
- Consistent wrapper for all workspaces
- Props: `children`, `title`, `actions?`
- Returns: Styled container with header and scrollable content

### 3. Workspace Panel Placeholders

Create these placeholder components in `ui/workspaces/`:

Each panel should:
- Accept `matterId` or `intakeId` prop
- Display panel title and description
- Show "Not yet implemented" placeholder
- Include the stage ID (W0-W11) in comments

Panels to create:
- `MatterOverviewPanel.tsx` — Matter dashboard, status
- `StoryWorkspacePanel.tsx` — W2 Case story editing
- `EvidenceWorkspacePanel.tsx` — W4 Evidence upload, browse
- `AssertionsWorkspacePanel.tsx` — W5 Assertions, support matrix
- `StrategyWorkspacePanel.tsx` — W6 Strategy memo editing
- `ResearchWorkspacePanel.tsx` — W7 Research memo editing
- `ArgumentWorkspacePanel.tsx` — W8 Argument draft editing
- `AdversarialWorkspacePanel.tsx` — W9 Adversarial critique
- `OutputWorkspacePanel.tsx` — W11 Output artifacts
- `IntakeWorkspacePanel.tsx` — W0 Intake detail workspace

### 4. Plugin Manifest

Create `manifest.yaml` with:
- Plugin identity (`lexos_litigation`, version `1.0.0-mvo`)
- UI panel declarations for all 10 panels
- Route mappings for each panel
- Mode support (`development` only for MVO)

### 5. Type Definitions

Create `ui/types/index.ts` with:
- Panel props interfaces
- Stage IDs enum (W0-W11)
- Matter/Intake reference types

## Explicit Non-Goals

Do NOT:
- Copy code from `/Users/linktrend/Projects/LiNKtrend-LEXOS`
- Implement business logic or data fetching
- Connect to Supabase or any external service
- Add actual legal workflow behavior
- Create complex UI interactions
- Add animations or transitions

## Acceptance Criteria

- [ ] Directory structure exists
- [ ] 4 base layout components have skeleton implementations
- [ ] 10 workspace panels have placeholder components
- [ ] Plugin manifest declares all panels
- [ ] TypeScript types defined
- [ ] No business logic implemented (stubs only)
- [ ] All files use TypeScript

## Proof Required

Your agent report must include:
1. File tree listing (`find plugins/vertical/lexos -type f`)
2. Component count summary
3. Manifest content showing panel declarations
4. One example component source (your choice)

## Report Location

Update: `.ai-swarm/AGENT_REPORTS/WP-122-lexos-ui-workspace-scaffold.md`

## Git Workflow

```bash
# Stage all changes
git add plugins/vertical/lexos/
git add .ai-swarm/

# Commit with descriptive message
git commit -m "WP-122: LEXOS UI workspace scaffold

- Create plugin directory structure
- Add base layout components (4)
- Add workspace panel placeholders (10)
- Create plugin manifest with panel declarations
- Add TypeScript type definitions"

# Push to remote
git push -u origin dev/cursor/WP-122-lexos-ui-workspace-scaffold
```

## Stop Conditions

Stop and report blockers if:
- Unrelated dirty files exist in worktree
- Plugin architecture conflicts with `PLUGIN_ARCHITECTURE_V2.md`
- Conflicting files exist in target location
- You need to copy actual LEXOS code to proceed

## Success Criteria

This packet is complete when:
1. All scaffold files exist with proper structure
2. No errors in TypeScript syntax
3. Manifest declares all UI panels
4. Report is updated with proof
5. Changes committed and pushed
