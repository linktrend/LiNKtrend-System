# WP-231 — LinkSkills Terminology Governance UI

## Objective

Align LinkSkills-facing UI terminology with the approved model:

- Skill = packaged ability folder (`SKILL.md`, scripts, references, assets/templates, examples).
- Capability = governed permission/action against a provider.
- Provider = external system.
- Tool = callable API/script/browser/action used during execution.
- Lease, Policy, Approval, Scope, Output, Side Effect, Catalog, Certification.

This packet is UI/UX/copy-first and should not rewire LinkSkills runtime.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-231-linkskills-terminology-governance-ui`
- Branch: `wp-231-linkskills-terminology-governance-ui`

## Dependencies

- Depends on WP-226 commit.

## Allowed Files

- `LiNKaios/linkaios-web/src/app/(shell)/skills/**`
- `LiNKaios/linkaios-web/src/components/*skill*.tsx`
- `LiNKaios/linkaios-web/src/components/catalog-ui.tsx`
- `LiNKaios/linkaios-web/src/lib/skill*.ts`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/**`
- `.ai-swarm/AGENT_REPORTS/WP-231-linkskills-terminology-governance-ui.md`
- `.ai-swarm/AGENT_REPORTS/LINKAIOS_UIUX_REVIEW_BACKLOG.md`

## Prohibited Files

- LinkSkills service runtime under `LiNKskills/services/logic-engine`.
- Database migrations.
- Provider credential handling.
- Projects/Modules/LinkBrain/LinkBots pages except links.

## Required Context

- WP-226 report and commit.
- Existing Skills pages/components.
- `.ai-swarm/CONTRACTS_MVO.md` LinkSkills sections.
- `.ai-swarm/AGENT_REPORTS/CURRENT_STATE_VERIFICATION_WARNING.md`

## Required UI/UX Skills

Use `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, and `deslop`.

## Steps

1. Verify clean packet worktree before editing.
2. Update Skills/Tools UI copy to clarify Skill, Capability, Provider, Tool, Lease, Policy, Approval, Scope, Output, Side Effect, Catalog, Certification.
3. Add visual separation between outputs and side effects using approved status/color language.
4. Add client/vendor visibility markers where relevant: client sees enabled/licensed governance controls; vendor sees catalog/certification/policy template surfaces.
5. Avoid implying client can inspect protected vendor implementation details.
6. Add backlog entries for runtime LinkSkills wiring not implemented in this UI pass.

## Acceptance Criteria

- Skills UI no longer conflates skills/capabilities/tools/providers.
- Output vs side effect is explained in plain UI copy.
- Vendor-only vs client-visible governance surfaces are easy to identify.
- No runtime LinkSkills behavior is changed.

## Proof Required

- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused tests if helpers/components are added.
- Browser screenshots for relevant Skills/Tools/Catalog pages.
- Report file: `.ai-swarm/AGENT_REPORTS/WP-231-linkskills-terminology-governance-ui.md`

## Completion Handoff

Commit all intended changes on the packet branch and record final commit SHA, files changed, commands run, screenshots/proof, blockers, and next step in the report.
