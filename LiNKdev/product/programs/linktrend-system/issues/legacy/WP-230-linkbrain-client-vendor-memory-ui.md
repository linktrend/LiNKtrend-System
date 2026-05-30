# WP-230 — LiNKbrain Client Vendor Memory UI

## Objective

Align LiNKbrain UI with the approved vendor/client memory model:

- Client company memory is client-owned IP.
- Vendor memory contains vendor-owned modules/project types/skills and anonymized aggregated learning.
- Client sees company/project/LiNKbot memory and allowed traces/outputs.
- Vendor sees module/project-type/skill/anonymized learning views through role-aware surfaces.

This packet is UI/UX-first and should not implement deep cross-database enforcement.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-230-linkbrain-client-vendor-memory-ui`
- Branch: `wp-230-linkbrain-client-vendor-memory-ui`

## Dependencies

- Depends on WP-226 commit.

## Allowed Files

- `LiNKaios/linkaios-web/src/app/(shell)/memory/**`
- `LiNKaios/linkaios-web/src/components/linkbrain/**`
- `LiNKaios/linkaios-web/src/lib/linkbrain*.ts`
- `LiNKaios/linkaios-web/src/lib/memory*.ts`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/**`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-230-linkbrain-client-vendor-memory-ui.md`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/LINKAIOS_UIUX_REVIEW_BACKLOG.md`

## Prohibited Files

- Database migrations.
- Retrieval algorithm rewrites.
- Cross-tenant data access changes.
- LinkSkills/LinkBots/Projects pages except links.

## Required Context

- WP-226 report and commit.
- Existing LiNKbrain pages/components.
- `LiNKdev/product/reports/archive/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`
- `LiNKdev/product/grounding/DECISIONS.md` D-082 memory decisions.

## Required UI/UX Skills

Use `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, and `deslop`.

## Steps

1. Verify clean packet worktree before editing.
2. Keep Company sidebar/page meaning as client company.
3. Update LiNKbrain copy/labels to distinguish Client Company Memory, Project Memory, LiNKbot Memory, Vendor Module Memory, Project Type Knowledge, and Anonymized Learning.
4. Add role/scope badges or mock toggles where useful: `Client view`, `Vendor view`, `Client-private`, `Vendor-only`, `Shared published`, `Anonymized learning`.
5. Ensure Project Memory is not confused with Project Type Knowledge.
6. Add context hints for Ask LiNKbrain: client users retrieve client-visible memory; vendor users may retrieve vendor/anonymized knowledge.
7. Add backlog entries for future Issue/Workflow memory scopes and real permission enforcement.

## Acceptance Criteria

- LiNKbrain UI makes client/vendor memory boundaries visible.
- Client company memory is clearly client-owned and used to improve outputs for that tenant.
- Vendor learning is shown as anonymized/aggregated/reviewed, not raw client data.
- No UI suggests clients can see protected project-type internals.

## Proof Required

- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused tests if helpers/components are added.
- Browser screenshots for LiNKbrain main, Project/Company memory, and Ask surfaces.
- Report file: `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-230-linkbrain-client-vendor-memory-ui.md`

## Completion Handoff

Commit all intended changes on the packet branch and record final commit SHA, files changed, commands run, screenshots/proof, blockers, and next step in the report.
