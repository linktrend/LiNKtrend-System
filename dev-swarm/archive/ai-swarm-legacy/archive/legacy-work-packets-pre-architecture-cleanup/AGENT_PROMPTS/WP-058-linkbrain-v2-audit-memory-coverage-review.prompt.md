# WP-058 Agent Prompt - LiNKbrain V2 Audit Memory Coverage Review

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-058-linkbrain-v2-audit-memory-coverage-review.md`.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-058-linkbrain-v2-audit-memory-coverage-review`
5. Commit with message `docs: review LiNKbrain v2 audit memory coverage`
6. `git push -u origin dev/codex/WP-058-linkbrain-v2-audit-memory-coverage-review`

## Required reading

- `.cursor/rules/04-mvo-scope-and-stubbing.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-058-linkbrain-v2-audit-memory-coverage-review.md`
- `services/migrations/023_linkbrain_audit_envelope.sql`
- `services/migrations/026_linkbrain_rpc_wrapper.sql`

## Mission

Produce an evidence-based LiNKbrain v2 audit/memory coverage matrix and actionable gap list.

## Hard boundaries

- Do not weaken audit requirements.
- Do not invent new memory schema in this packet.

## Proof required

Record evidence paths, gap matrix, and follow-up owners in `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`.
