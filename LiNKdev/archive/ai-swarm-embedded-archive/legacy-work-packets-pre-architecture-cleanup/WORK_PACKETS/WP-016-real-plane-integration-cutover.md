# WP-016 — Real Plane integration cutover

## Objective

Replace local Plane stub writes (`mvo_projects`, `mvo_tasks`) with real Plane API/project-task synchronization while preserving LinkSkills lease governance and LiNKbrain audit traceability.

## Owner agent

integration-agent (primary), linkskills-agent (co-owner)

## Execution mode

- Codex: Plane adapter integration, idempotency mapping, tests
- Antigravity: LiNKaios workflow/trace verification for project/task creation
- Architect: API boundary and rollback policy review

## Allowed files

- `LiNKaios/linkaios-web/**` (Plane stage wiring only)
- `packages/linklogic-sdk/**` (Plane result contracts if needed)
- `packages/db/**` (idempotency mapping helpers)
- `services/migrations/**` (minimal mapping tables/RPC wrappers)
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- CRM provider implementation
- LiteLLM integration
- LEXOS implementation
- Non-Plane workflow redesign
- New third-party dependencies without explicit approval

## Dependencies

- WP-015 design finalized (shared external-integration patterns)
- Plane workspace/token readiness
- Existing `plane.project.create` and `plane.task.create` lease paths validated

## Required proof

- End-to-end run yields real Plane `project_id` and `task_id` refs in trace
- Idempotency proof on retry using same lead + key (no duplicate external tasks)
- Audit proof for `plane.project.created` and `plane.task.created`
- Agent report includes external API rate/error handling behavior

## Out of scope

Portfolio/reporting features in Plane beyond minimum MVO-equivalent tracking.
