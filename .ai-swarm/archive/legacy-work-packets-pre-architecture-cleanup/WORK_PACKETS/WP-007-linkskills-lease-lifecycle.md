# WP-007 — LinkSkills lease lifecycle

## Objective

Wire the MVO LinkSkills capability lease lifecycle for `crm.upsert`, `plane.project.create`, `plane.task.create`, and `preview.publish` using `LiNKskills/services/logic-engine` reuse first.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md` §§6.2, 7, 8, 11, 12.4
- `.ai-swarm/DECISIONS.md` D-01, D-02, D-03
- `.ai-swarm/INTEGRATION_QUEUE.md` INT-014, INT-020, INT-021, INT-022
- `LiNKskills/services/logic-engine`
- `LiNKskills/skills/`

## Allowed files

- `LiNKskills/services/logic-engine/**`
- `LiNKskills/skills/**`
- local tests for LinkSkills
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- LiNKaios orchestration/UI files
- LiNKbrain schema/writer except calling the agreed `brain.audit.write` surface
- LiNKautowork workflow bodies
- LiNKbot reasoning code
- Secrets or real external CRM/Plane/DigitalOcean clients

## Dependencies

- Start after WP-005 types are available or keep changes isolated behind local adapters that can be swapped to WP-005 imports.
- Coordinate with WP-006 for audit writer integration.

## Tasks

1. Inspect existing LinkSkills logic-engine capability, policy, ledger, idempotency, and kill-switch patterns.
2. Implement or adapt lease states: `requested`, `granted`, `denied`, `requires_approval`, `executed`, `expired`, `revoked`.
3. Add capability catalog entries for:
   - `crm.upsert`
   - `plane.project.create`
   - `plane.task.create`
   - `preview.publish`
4. Implement idempotent `skills.lease.request` and `skills.lease.execute` surfaces.
5. Ensure executed leases emit `lease.executed` and the required output event to LiNKbrain.
6. Keep real external integrations out; call stub backends only when WP-012 provides them.
7. Update `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`.

## Acceptance criteria

- Lease lifecycle matches `CONTRACTS_MVO.md` §6.2.
- Capability args/results match §7.
- Kill switch denial returns `LEASE_KILL_SWITCH` without state mutation.
- Re-execute with the same idempotency key returns the original result.
- No capability executes without a ledger entry and LiNKbrain audit event.

## Required proof

- Unit/integration test output or executable smoke proof.
- Agent report includes capability list, lease state proof, and audit event proof/stub note.

## Out of scope

CRM/Plane schema creation, preview rendering, LiNKaios approvals UI, LiNKbot reasoning, LiNKbrain schema design.
