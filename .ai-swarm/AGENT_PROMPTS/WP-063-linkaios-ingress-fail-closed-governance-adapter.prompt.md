# WP-063 Agent Prompt - LiNKaios Ingress Fail-Closed Governance Adapter

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-063-linkaios-ingress-fail-closed-governance-adapter.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree or checkout from latest `origin/development`.
4. Use branch `dev/codex/WP-063-linkaios-ingress-fail-closed-governance-adapter`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example worktree command:

```bash
git worktree add ../LiNKtrend-System-WP-063 -b dev/codex/WP-063-linkaios-ingress-fail-closed-governance-adapter origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKBOT_CORE_SYNC_READINESS.md`
- `.ai-swarm/WORK_PACKETS/WP-063-linkaios-ingress-fail-closed-governance-adapter.md`

## Mission

Enforce fail-closed validation on LiNKaios dispatch to LinkBot when required governance payload fields are missing or invalid.

## Hard Boundaries

- LinkBot remains a thin runtime shell.
- Do not create any governance bypass or silent downgrade.
- Do not implement LinkSkills capability runtime here.
- Do not modify unrelated vertical plugin logic.
- Keep changes narrowly scoped to dispatch/orchestration and shared types only if needed.

## Proof Required

- Tests or typecheck proving valid dispatch still works.
- Tests proving missing/invalid governance payload fails closed.
- Evidence that rejection maps to canonical failure code and audit behavior.
- Update `.ai-swarm/AGENT_REPORTS/linkaios-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: fail closed LinkBot governance ingress`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
