# Agent Prompt — WP-231 LinkSkills Terminology Governance UI

You are Codex working as a senior frontend/product UX engineer.

Execute `dev-swarm/programs/linktrend-system/issues/legacy/WP-231-linkskills-terminology-governance-ui.md` exactly.

## Model / Mode

Use GPT-5.3 Codex or equivalent code-focused model.

## Mandatory Context

Read before editing:

1. `dev-swarm/programs/linktrend-system/issues/legacy/WP-231-linkskills-terminology-governance-ui.md`
2. WP-226 report and final commit
3. `dev-swarm/reports/legacy-ai-swarm/CURRENT_STATE_VERIFICATION_WARNING.md`
4. Existing Skills/Tools pages/components
5. `dev-swarm/command-center/CONTRACTS_MVO.md` LinkSkills sections
6. `.cursor/rules/01-ecosystem-boundaries.mdc`
7. `.cursor/rules/03-agent-swarm-coordination.mdc`
8. `.cursor/rules/07-ui-and-frontend-standards.mdc`

## UI Requirement

Clarify:

- Skill = packaged ability folder: `SKILL.md`, scripts, references, assets/templates, examples.
- Capability = governed permission/action against a provider.
- Provider = external system.
- Tool = concrete callable API/script/browser/action.
- Lease = time-scoped grant.
- Policy = rules governing skills/capabilities/tools/leases/approvals/providers/credentials/scopes/runs.
- Approval = decision unlocking an action/transition/capability/tool/workflow/side effect.
- Output = what system produces.
- Side Effect = what system changes externally or durably.
- Catalog and Certification are vendor-governed registry/validation surfaces.

Mark vendor-only catalog/certification/policy-template surfaces. Do not expose protected implementation details to client view.

## Required UI/UX Skills And Abilities

Use `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, `deslop`, and `verify-this`. Use `shadcn` only after verifying initialization.

## Branch Workflow

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Proof

Run:

```bash
pnpm --filter @linktrend/linkaios-web typecheck
```

Capture browser screenshots for relevant Skills/Tools/Catalog pages.

## Required Report

Write `dev-swarm/reports/legacy-ai-swarm/WP-231-linkskills-terminology-governance-ui.md` with files changed, commands run, screenshots/proof, blockers, final commit SHA, and backlog items.

## Completion

Before stopping:

1. Commit all intended code, docs, reports, generated topology files, and proof artifacts on the packet branch.
2. Record the final commit SHA, files changed, commands run, proof produced, blockers, and next step in the required report.
3. Verify `git status --short` is clean after the commit, except for explicitly documented excluded files.
4. Push the packet branch unless the user explicitly forbids pushing.
