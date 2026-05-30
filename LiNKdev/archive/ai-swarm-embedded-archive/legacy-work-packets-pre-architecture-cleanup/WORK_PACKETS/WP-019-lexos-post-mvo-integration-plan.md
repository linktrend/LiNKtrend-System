# WP-019 — LEXOS post-MVO integration plan (planning only)

## Objective

Produce a scoped, dependency-aware integration plan for LEXOS as a future vertical plugin, without implementing any LEXOS runtime, API, or UI code.

## Owner agent

architect (primary)

## Execution mode

- Codex: documentation synthesis only
- Antigravity: none
- Architect: final boundary and sequencing decisions

## Allowed files

- `.ai-swarm/WORK_PACKETS/**` (new planning packets only)
- `.ai-swarm/DECISIONS.md` (if new post-MVO decision rows are required)
- `.ai-swarm/INTEGRATION_QUEUE.md` (status/notes updates only)
- `.ai-swarm/AGENT_REPORTS/architect.md`
- `docs/ecosystem/**` (planning docs only)

## Prohibited files

- `apps/**`, `packages/**`, `services/**` implementation changes
- Any LEXOS codebase implementation work
- New dependencies/services

## Dependencies

- WebsiteFactory MVO sign-off accepted
- Post-MVO integration outcomes from WP-015 to WP-018 reviewed

## Required proof

- A written LEXOS readiness checklist with explicit go/no-go gates
- Proposed contract deltas (if any) documented before code work
- Clear sequencing recommendation for first legal-specific capability set
- Architect report entry with risks, blockers, and prerequisite integrations

## Out of scope

Starting LEXOS implementation.
