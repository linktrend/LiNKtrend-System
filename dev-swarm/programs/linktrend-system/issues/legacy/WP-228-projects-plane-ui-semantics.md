# WP-228 — Projects And Plane UI Semantics

## Objective

Align the Projects UI with the approved model:

- Project = client-specific instance of a vendor-supplied Project Type.
- Projects list shows all projects across all modules.
- New Project flow selects Module -> Project Type -> intake/start.
- Plane remains the main project-management board, with LiNKaios as orchestration/control plane.

This packet is UI/UX-first and should not implement deep Plane backend wiring.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-228-projects-plane-ui-semantics`
- Branch: `wp-228-projects-plane-ui-semantics`

## Dependencies

- Depends on WP-226 commit.
- May coordinate with WP-227 only through shared helpers from WP-226; do not require WP-227 output.

## Allowed Files

- `LiNKaios/linkaios-web/src/app/(shell)/projects/**`
- `LiNKaios/linkaios-web/src/components/projects-*.tsx`
- `LiNKaios/linkaios-web/src/components/project-*.tsx`
- `LiNKaios/linkaios-web/src/lib/project*.ts`
- `LiNKaios/linkaios-web/src/lib/plane-links.ts`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/**`
- `dev-swarm/reports/legacy-ai-swarm/WP-228-projects-plane-ui-semantics.md`
- `dev-swarm/reports/legacy-ai-swarm/LINKAIOS_UIUX_REVIEW_BACKLOG.md`

## Prohibited Files

- Database migrations.
- Real Plane API writes beyond existing behavior.
- Module catalogue pages owned by WP-227.
- LinkBot pages owned by WP-229.

## Required Context

- WP-226 report and commit.
- Existing Projects pages and Plane bridge components.
- `dev-swarm/reports/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`

## Required UI/UX Skills

Use `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, and `deslop`.

## Steps

1. Verify clean packet worktree before editing.
2. Replace user-facing Mission language with Project where touched.
3. Update Projects index to show Module, Project Type, current Workflow, active Issue/approval, and Plane sync status when available/mockable.
4. Add or improve `New Project` entry flow as UI-only/mock-safe: choose Module -> Project Type -> intake/start explanation.
5. Clarify Plane relationship in UI copy: Open in Plane for execution board; LiNKaios for orchestration, approvals, traces, outputs.
6. Update Project detail to show module/project-type context and client-safe lifecycle status without exposing protected workflow internals.
7. Add backlog entries for backend wiring and repo-wide Mission rename.

## Acceptance Criteria

- Projects UI communicates that projects are module/project-type lifecycle instances.
- Plane relationship is visible and not confusing.
- New Project flow does not look like arbitrary blank project creation.
- Client-safe vs vendor-only/protected internals are clear where relevant.

## Proof Required

- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused tests if helpers/components are added.
- Browser screenshots for Projects index, Project detail, and New Project flow/surface.
- Report file: `dev-swarm/reports/legacy-ai-swarm/WP-228-projects-plane-ui-semantics.md`

## Completion Handoff

Commit all intended changes on the packet branch and record final commit SHA, files changed, commands run, screenshots/proof, blockers, and next step in the report.
