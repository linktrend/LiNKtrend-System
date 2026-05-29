# WP-079 Agent Prompt - LinkSkills Golden Template and Skill SDK

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-079-linkskills-golden-template.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree or checkout from latest `origin/development`.
4. Use branch `dev/codex/WP-079-linkskills-golden-template`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example worktree command:

```bash
git worktree add ../LiNKtrend-System-WP-079 -b dev/codex/WP-079-linkskills-golden-template origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-079-linkskills-golden-template.md`
- `/Users/linktrend/Projects/LiNKskills/skills/skill-template/SKILL.md`
- `/Users/linktrend/Projects/LiNKskills/skills/skill-architect/SKILL.md`
- `/Users/linktrend/Projects/LiNKskills/PRD_LINKSKILLS_LOGIC_ENGINE.md`

## Mission

Preserve the LinkSkills Golden Template in the current ecosystem and add the first SDK-level skill manifest validation/scaffolding surface for governed LiNKbot skill usage.

## Hard Boundaries

- Copy/adapt the Golden Template; do not rewrite it into a generic AI template.
- Do not change LiNKbot runtime code.
- Do not implement progressive disclosure token signing; WP-080 owns that.
- Do not add broad dependencies unless the repo already uses them for markdown/frontmatter parsing.

## Proof Required

- Tests for skill manifest validation and scaffolding helpers.
- Typecheck or package-level test command for touched package(s).
- Update `.ai-swarm/AGENT_REPORTS/linkskills-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: add LinkSkills golden template SDK`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
