# WP-071 Agent Prompt - LiNKautowork Real Capability Calls

Recommended model/tool: Codex only if at least one bounded Codex task is safe. Otherwise Cursor Kimi.

Execute `.ai-swarm/WORK_PACKETS/WP-071-linkautowork-real-capability-calls.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-071 -b dev/codex/WP-071-linkautowork-real-capability-calls origin/development
cd ../LiNKtrend-System-WP-071
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-071-linkautowork-real-capability-calls.md`
- `.ai-swarm/WORK_PACKETS/WP-042-linksites-template-payload-discovery.md`
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`

## Mission

Replace or wrap LinkSites v2 workflow stubs with development-mode Supabase/Payload client calls where the discovered schemas are clear. If schema/runtime details are not sufficiently known, implement typed adapter interfaces plus mock-backed tests and document the exact remaining blocker.

## Hard Boundaries

- No production credentials.
- No schema invention.
- No production VPS/deploy work.
- All write operations must require `lease_id`.
- Keep scope bounded so this Codex task does not run long.

## Proof Required

- Focused tests for Supabase/Payload client behavior or mock-backed adapter behavior.
- Relevant `LiNKautowork/gateway` tests.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`.

## Finish

Commit message: `feat: add LinkSites real capability adapters`
Push branch and report branch, commit SHA, proof, and blockers.
