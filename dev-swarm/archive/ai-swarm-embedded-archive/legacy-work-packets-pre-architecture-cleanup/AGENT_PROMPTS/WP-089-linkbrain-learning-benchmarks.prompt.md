# WP-089 Agent Prompt - LiNKbrain Learning and Benchmarking

Recommended model/tool: Composer or Gemini 3 Flash. This is mostly planning/specification with a small schema option; do not use Codex.

Execute `.ai-swarm/WORK_PACKETS/WP-089-linkbrain-learning-benchmarks.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-089 -b dev/cursor/WP-089-linkbrain-learning-benchmarks origin/development
cd ../LiNKtrend-System-WP-089
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Dependency Gate

Do not implement benchmark aggregation against a table that is not merged yet. If WP-087 memory objects are absent, create a concrete design/spec and testable contract only.

## Required Reading

- `.ai-swarm/LINKBRAIN_COMPLETION_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-089-linkbrain-learning-benchmarks.md`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`

## Mission

Define the privacy-safe LiNKbrain learning loop and benchmark contract. Implement lightweight SDK schemas/tests if safe. Avoid heavy application code in this wave.

## Scope

Allowed:

- Add `.ai-swarm/LINKBRAIN_BENCHMARKING_SPEC.md`.
- Add SDK schemas for benchmark aggregate and feedback lifecycle if they do not conflict with WP-087.
- Add tests for anonymization/tenant-stripping logic if implementing code.
- Update `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`.

Hard boundaries:

- No PII or tenant-identifying fields in benchmark aggregates.
- No external analytics service.
- No live data aggregation.

## Proof Required

- Spec clearly lists fields that are allowed and prohibited.
- Tests if code is added.
- Report branch, commit SHA, proof, and blockers.

## Finish

Commit message: `docs: define LiNKbrain learning loop`
Push branch to GitHub.
