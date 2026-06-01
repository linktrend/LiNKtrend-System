# WP-080 Agent Prompt - LinkSkills Progressive Disclosure

Recommended model/tool: Cursor Kimi or Cursor Gemini 3.1 Pro. Do not use Codex unless explicitly approved.

Execute `.ai-swarm/WORK_PACKETS/WP-080-linkskills-progressive-disclosure.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-080 -b dev/cursor/WP-080-linkskills-progressive-disclosure origin/development
cd ../LiNKtrend-System-WP-080
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-080-linkskills-progressive-disclosure.md`
- `packages/linklogic-sdk/src/types/skill.ts`
- `packages/linklogic-sdk/templates/skill-golden.md`
- `LiNKskills/services/logic-engine/src/lease-lifecycle.ts`

## Mission

Implement a first progressive disclosure service for governed LiNKbot skill usage. Use existing `LiNKskills/services/logic-engine` if `packages/linkskills-core` does not exist.

## Hard Boundaries

- Do not disclose full skill source by default.
- Do not bulk import skills from `/Users/linktrend/Projects/linktrend-skills`.
- Use Golden Template types/structure.
- Keep signing simple and development-safe if production key infrastructure is missing.

## Proof Required

- Token generation/validation tests.
- Manifest fragment minimization tests.
- Lease-required issuance test if feasible.
- Update `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`.

## Finish

Commit message: `feat: add LinkSkills progressive disclosure`
Push branch and report branch, commit SHA, proof, and blockers.
