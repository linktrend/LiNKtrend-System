# WP-227 — Modules And Project Types UI

## Objective

Implement the client/vendor-aware Modules UI discovery paths:

- Browse by Module: Module Catalogue -> Module -> Project Types -> Workflows -> Issues.
- Browse by Project Type: Project Type Catalogue -> Project Type -> Module context -> Workflows -> Issues.

This packet is UI/UX-first and may use mock/static data for published/licensed/client-safe surfaces.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-227-modules-and-project-types-ui`
- Branch: `wp-227-modules-and-project-types-ui`

## Dependencies

- Depends on WP-226 commit.

## Allowed Files

- `LiNKaios/linkaios-web/src/app/(shell)/modules/**`
- `LiNKaios/linkaios-web/src/components/**`
- `LiNKaios/linkaios-web/src/lib/**`
- `LiNKaios/linkaios-web/src/components/shell-sidebar.tsx`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-227-modules-and-project-types-ui.md`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/LINKAIOS_UIUX_REVIEW_BACKLOG.md`

## Prohibited Files

- Database migrations.
- Real module execution logic.
- Protected vendor project-type internals beyond safe mock/display metadata.
- LinkBots, LinkBrain, LinkSkills pages except shared nav links if unavoidable.

## Required Context

- WP-226 report and commit.
- `LiNKdev/product/reports/archive/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`
- `.cursor/rules/07-ui-and-frontend-standards.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- Existing `modules/` docs.

## Required UI/UX Skills

Use `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, `deslop`, and `shadcn` only after verifying initialization.

## Steps

1. Verify clean packet worktree before editing.
2. Add a Modules sidebar entry if missing.
3. Build Module Catalogue UI with module list and client-safe licensed/published status.
4. Build Project Type Catalogue UI as alternate discovery path.
5. For vendor-scope/mock vendor view, clearly mark vendor-only controls/sections with `Vendor-only` badges so human review can identify them.
6. For client-scope/mock client view, only show licensed/published modules and client-safe operational details.
7. Show workflows/issues as safe display summaries only; do not expose protected internal workflow logic.
8. Add route-level empty/loading/error states as needed.

## Acceptance Criteria

- `/modules` or equivalent route renders two clear paths: Browse by Module and Browse by Project Type.
- A selected module shows project types.
- A selected project type shows module context, workflows, and issues.
- Vendor-only and client-visible sections are visibly denoted.
- No page suggests clients can inspect protected project-type internals.

## Proof Required

- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused tests if helpers are added.
- Browser screenshots for Modules and Project Type Catalogue.
- Report file: `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-227-modules-and-project-types-ui.md`

## Completion Handoff

Commit all intended changes on the packet branch and record final commit SHA, files changed, commands run, screenshots/proof, blockers, and next step in the report.
