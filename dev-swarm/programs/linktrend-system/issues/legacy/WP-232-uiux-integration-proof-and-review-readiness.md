# WP-232 — UI/UX Integration Proof And Review Readiness

## Objective

Integrate WP-226 through WP-231 into `development`, resolve UI conflicts, verify the full role-aware product-model UI, and produce a human-review-ready report. Do not produce completion percentages.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-232-uiux-integration-proof-and-review-readiness`
- Branch: `wp-232-uiux-integration-proof-and-review-readiness`

## Dependencies

- Must run after WP-226 through WP-231 are committed.

## Allowed Files

- Integration changes needed across `LiNKaios/linkaios-web/src/**`.
- `.ai-swarm/AGENT_REPORTS/WP-232-uiux-integration-proof-and-review-readiness.md`
- `.ai-swarm/AGENT_REPORTS/LINKAIOS_UIUX_REVIEW_BACKLOG.md`
- Browser proof artifacts under `.ai-swarm/AGENT_REPORTS/artifacts/uiux-product-model/`

## Prohibited Files

- Database migrations unless explicitly approved by the user after UI review.
- Backend/runtime enforcement outside necessary UI integration.
- Completion percentage reports.

## Required Context

- Reports and commits from WP-226 through WP-231.
- `.ai-swarm/AGENT_REPORTS/CURRENT_STATE_VERIFICATION_WARNING.md`
- `.cursor/rules/06-testing-and-proof.mdc`
- `.cursor/rules/07-ui-and-frontend-standards.mdc`

## Required UI/UX Skills

Use `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, `run-smoke-tests`, `verify-this`, and `deslop`. Use `shadcn` only after verifying initialization.

## Steps

1. Verify clean integration worktree before editing.
2. Merge/import WP-226 through WP-231 in dependency order.
3. Resolve conflicts without losing vendor/client markers or client-safe IP boundaries.
4. Run post-merge typecheck and focused tests.
5. Start local LiNKaios web with documented dev/UI flags.
6. Browser-review: Home, Projects, Modules, Project Type Catalogue, LinkBots, LinkBrain, Skills, Work, Settings.
7. Capture desktop/tablet/mobile screenshots for key changed surfaces.
8. Update backlog with remaining UI/UX and backend wiring items.
9. Write report with exact proof and caveats. Do not claim system/UI completion percentage.

## Acceptance Criteria

- All integrated UI routes compile and render.
- Vendor-only and client-visible areas are visibly denoted.
- Mission is hidden from user-facing labels in touched UI, with repo-wide rename backlog preserved.
- Projects/Modules/LinkBots/LinkBrain/LinkSkills UI all reflect the approved product model.
- Report clearly separates verified UI readiness from unimplemented backend enforcement.

## Proof Required

- `pnpm dev:uiux:prepare`
- `pnpm --filter @linktrend/linkaios-web typecheck`
- Relevant focused tests.
- Browser screenshots and console/network notes.
- Report file: `.ai-swarm/AGENT_REPORTS/WP-232-uiux-integration-proof-and-review-readiness.md`

## Completion Handoff

Commit all intended changes on the packet branch and record final commit SHA, files changed, commands run, screenshots/proof, blockers, and next step in the report.
