# WP-226 — LiNKaios Product Model UI Foundation

## Objective

Create the shared UI/product-model foundation for the approved LiNKaios terminology and vendor/client view split, without deep backend/schema rewiring.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-226-linkaios-product-model-ui-foundation`
- Branch: `wp-226-linkaios-product-model-ui-foundation`

## Dependencies

- Start from current `development`.
- Must read `LiNKdev/product/reports/archive/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`.

## Allowed Files

- `LiNKaios/linkaios-web/src/lib/**`
- `LiNKaios/linkaios-web/src/components/**`
- `LiNKaios/linkaios-web/src/app/(shell)/settings/**`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-226-linkaios-product-model-ui-foundation.md`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/LINKAIOS_UIUX_REVIEW_BACKLOG.md`

## Prohibited Files

- Database migrations.
- Runtime execution code outside UI/lib helpers.
- Any file under another packet's new module/project/linkbot/linkbrain/linkskills UI scope unless required for shared constants.
- Real vendor IP/project-type internals.

## Required Context

- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.cursor/rules/07-ui-and-frontend-standards.mdc`
- `docs/architecture/repo-architecture-target.md`
- `LiNKdev/product/grounding/ARCHITECTURE_RULES.md`
- `LiNKdev/product/grounding/CONTRACTS_MVO.md`
- `LiNKdev/product/grounding/REPO_INVENTORY.md`
- `LiNKdev/product/grounding/DECISIONS.md`

## Required UI/UX Skills

Use repo/Cursor skills where available: `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `shadcn` only after verifying initialization, `control-ui`, `deslop`, and `verify-this`.

## Steps

1. Verify clean packet worktree before editing.
2. Define shared user-facing vocabulary: Module, Project Type, Project, Workflow, Issue, Run, Trace; hide Mission in UI labels where this packet touches.
3. Define shared vendor/client display markers: `Vendor-only`, `Client-visible`, `Licensed`, `Protected IP hidden`, `Client company memory`, `Anonymized vendor learning`.
4. Define shared status/color helper guidance for Project Type, Project, Workflow, Issue, Run, Approval, Lease, Provider/Tool, LinkBot, Sync.
5. Add a backlog entry that repo-wide `mission` internal naming must be replaced later after UI/UX review.
6. Do not implement database/schema enforcement.

## Acceptance Criteria

- Shared UI helpers/types or documentation exist for terminology, role/scope badges, and status colors.
- Other packets can import or follow these helpers without guessing terminology.
- No protected vendor workflow/project-type internals are encoded.
- UI-visible wording avoids "Mission" where touched; backlog records repo-wide rename as future work.

## Proof Required

- `pnpm --filter @linktrend/linkaios-web typecheck`
- Any focused tests added by this packet.
- Report file: `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-226-linkaios-product-model-ui-foundation.md`

## Completion Handoff

Commit all intended changes on the packet branch and record final commit SHA, files changed, commands run, proof, blockers, and next step in the report.
