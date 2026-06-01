# WP-082 Agent Prompt - LiNKbrain Completion Plan

Recommended model/tool: Cursor Gemini 3 Flash or Gemini 3.1 Pro Low. Do not use Codex.

Execute `.ai-swarm/WORK_PACKETS/WP-082-linkbrain-completion-plan-memory-retrieval.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-082 -b dev/cursor/WP-082-linkbrain-completion-plan-memory-retrieval origin/development
cd ../LiNKtrend-System-WP-082
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Mission

Create `.ai-swarm/LINKBRAIN_COMPLETION_PLAN.md` and follow-up packets defining what remains for LiNKbrain to be complete enough as memory/audit/retrieval/learning plane.

## Required Reading

- `.ai-swarm/WORK_PACKETS/WP-082-linkbrain-completion-plan-memory-retrieval.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`
- `.ai-swarm/WORK_PACKETS/WP-058-linkbrain-v2-audit-memory-coverage-review.md`
- `Archive/LiNKaios/packages/linkbrain/` if present

## Finish

Commit message: `docs: define LiNKbrain completion plan`
Push branch and report branch, commit SHA, proof, and blockers.
