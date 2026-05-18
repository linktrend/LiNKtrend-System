# WP-006 — LiNKbrain audit envelope and writer

## Objective

Implement the LiNKbrain audit envelope contract from `CONTRACTS_MVO.md` §6.3 so all planes can write standardized audit events for the MVO.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/DECISIONS.md` D-08
- `.ai-swarm/REPO_INVENTORY.md`
- `Archive/LiNKaios/packages/linkbrain` as schema reference
- `services/migrations`

## Allowed files

- LiNKbrain-related migrations under `services/migrations/**`
- LiNKbrain package/service files if present in this repo
- `packages/linklogic-sdk/**` only for imports from WP-005, not for redefining types
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`

## Prohibited files

- LinkSkills lease implementation
- LiNKautowork workflow implementation
- LiNKbot reasoning implementation
- LiNKaios UI/orchestration implementation
- Secrets, env files, deployment config

## Dependencies

- May run in parallel with WP-005 for schema planning.
- Must use WP-005 exported types before final integration if those types are available.

## Tasks

1. Inspect existing migrations and archived LiNKbrain schema for reusable audit/event patterns.
2. Add or adapt migration(s) for a canonical audit event ledger matching `AuditEvent`.
3. Implement a minimal `brain.audit.write` writer surface or repository function in the appropriate LiNKbrain location.
4. Enforce required fields: `event_id`, `ts`, `tenant_id`, `plane`, `actor`, `action`, `subject`, `schema_version`.
5. Enforce PII rules from `CONTRACTS_MVO.md` §3.4 and §6.3.
6. Add focused tests or migration validation if local patterns exist.
7. Update `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`.

## Acceptance criteria

- Audit events can be persisted with the canonical envelope.
- Invalid events are rejected before persistence.
- The ledger can store references for run, stage, lease, workflow, preview, CRM, project, and task IDs.
- No business action or workflow execution is added to LiNKbrain.

## Required proof

- Migration validation or test output.
- Example audit event shape included in the agent report.
- Agent report documents reused archived schema or why it was not reused.

## Out of scope

Long-term memory retrieval, learning pipelines, capability leases, workflow execution, LiNKbot reasoning, UI trace rendering.
