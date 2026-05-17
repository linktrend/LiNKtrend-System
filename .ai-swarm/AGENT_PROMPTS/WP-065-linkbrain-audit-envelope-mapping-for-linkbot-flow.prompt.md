# WP-065 Agent Prompt - LiNKbrain Audit Envelope Mapping for LinkBot Flow

You are working on the LiNKtrend-System repo.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Start from `/Users/linktrend/Projects/LiNKtrend-System`.
2. Run `git fetch origin --prune`.
3. Create a packet-specific worktree or checkout from latest `origin/development`.
4. Use branch `dev/codex/WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow`.
5. Run `git status --short --branch` before editing.
6. If unrelated dirty files exist, stop before editing and report the blocker.

Example:

```bash
git worktree add ../LiNKtrend-System-WP-065 -b dev/codex/WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow origin/development
```

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKBOT_ADAPTER_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow.md`
- `packages/observability/**`
- Existing LiNKbrain audit writer usages in `apps/linkaios-web`

## Mission

Map LinkBot lifecycle, LinkSkills capability events, and LiNKautowork workflow events into the canonical LiNKbrain audit envelope without creating an alternate audit store.

## Hard Boundaries

- LiNKbrain remains canonical memory/audit owner.
- Do not rename existing canonical event taxonomy incompatibly.
- Do not implement LinkBot runtime behavior here.
- Keep this to mapping helpers/fixtures/tests and minimal bridge code.

## Proof Required

- Mapping table or helper tests proving required events normalize into canonical envelope.
- Integration fixture/test showing trace queryability by `run_id` and `stage_id` if existing test patterns allow it.
- Update `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md` with files changed, commands run, proof, blockers, branch, and commit SHA.

## Finish

1. Commit only this packet's files.
2. Commit message: `feat: map LinkBot events to audit envelope`
3. Push branch to origin.
4. Report branch, commit SHA, commands run, proof, and blockers.
