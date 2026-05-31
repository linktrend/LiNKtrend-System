# WP-116 Agent Prompt - LiNKbrain Cross-Vertical Trace Dashboard Schema

Use Kimi for this packet. This is schema and spec work; do not use Codex or Antigravity unless the orchestrator changes this assignment.

Execute `.ai-swarm/WORK_PACKETS/WP-116-linkbrain-cross-vertical-trace-dashboard-schema.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-116 -b dev/cursor/WP-116-linkbrain-cross-vertical-trace-dashboard-schema origin/development
cd ../LiNKtrend-System-WP-116
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Dependency Gate

Do not implement trace aggregation against tables that are not merged yet. If WP-087 memory objects or WP-089 benchmark aggregates are absent, create concrete design/spec and testable contract only.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKBRAIN_COMPLETION_PLAN.md`
- `.ai-swarm/LINKBRAIN_BENCHMARKING_SPEC.md`
- `packages/linklogic-sdk/src/brain-memory.ts`
- `packages/linklogic-sdk/src/brain-benchmarks.ts`
- `.ai-swarm/WORK_PACKETS/WP-116-linkbrain-cross-vertical-trace-dashboard-schema.md`

## Mission

Define LiNKbrain schema and SDK contracts for cross-vertical trace querying and dashboard aggregation. This enables operators to view workflow traces across LinkSites, LEXOS, and LiNKapps verticals.

## Scope

Allowed:

- Add `.ai-swarm/LINKBRAIN_CROSS_VERTICAL_TRACE_SCHEMA.md`.
- Add SDK schemas for trace summary, query request/response, and privacy-safe aggregates if they do not conflict with WP-087 or WP-089.
- Add tests for query validation and privacy stripping logic.
- Update `.ai-swarm/AGENT_REPORTS/WP-116-linkbrain-cross-vertical-trace-dashboard-schema.md`.

Hard boundaries:

- No PII or tenant-identifying fields in cross-vertical trace aggregates.
- No live trace aggregation workers.
- No dashboard UI implementation.
- No database migrations unless dependencies are merged.

## Privacy Requirements for Cross-Vertical Traces

Per `LINKBRAIN_BENCHMARKING_SPEC.md` §5, the following fields MUST NOT appear in cross-vertical trace aggregates:

- Identity & tenancy: `tenant_id`, `org_id`, `workspace_id`, `account_id`, `customer_id`
- People: Names, emails, phone numbers, auth subject IDs
- Endpoints: IP addresses, full URLs containing customer-owned hosts
- CRM/ticketing: CRM record IDs, Plane project keys revealing client names
- Content: Prompts, completions, documents, raw payloads

Allowed in cross-vertical aggregates:

- Temporal: `bucket_start`, `bucket_end`, `hour`, `day`
- Coarse taxonomy: `vertical_key` (`linksites`, `lexos`, `linkapps`), `stage_slug`, `outcome`
- Statistical: `count`, `avg_duration_ms`, `failure_rate`, `p95_latency_ms`
- Provenance: `schema_version`, `aggregation_job_id` (internal UUID)

## Proof Required

- Spec clearly lists allowed and prohibited fields for trace aggregates.
- SDK schemas compile and export without collisions.
- Tests validate query shapes and privacy stripping.
- Report includes branch, commit SHA, proof, and blockers.

## Finish

Commit message: `docs: define cross-vertical trace dashboard schema`
Push branch to GitHub.
