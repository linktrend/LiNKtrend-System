# Dev Swarm sandbox decision (DS-B12)

## Decision

**Phase 1 (MVO factory):** Use **git worktrees** under `.worktrees/<issue-id>/` per `.cursor/rules/03-agent-swarm-coordination.mdc`. No container sandbox required for Dev Swarm bootstrap.

## Rationale

- LiNKtrend executors already use packet worktrees.
- open-swe-style containers add ops cost before first program ships.
- `verify.sh` + allowlists provide sufficient isolation for meta-factory work.

## Future trigger for containers

Revisit when:

- Executors run untrusted code generation across tenants, or
- Plane/live CRM side effects go **live** without capability lease stubs.

## If adopted later

Document connector in `dev-swarm/automations/README.md` and add issue tier `critical` container requirement.
