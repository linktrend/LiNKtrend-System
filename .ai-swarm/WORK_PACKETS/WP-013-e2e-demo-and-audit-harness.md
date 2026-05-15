# WP-013 — End-to-end demo and audit assertion harness

## Objective

Verify the full WebsiteFactory lead-to-preview MVO through LiNKaios and assert the required lease, workflow, audit, memory, and trace artifacts.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md` §§8, 9, 10, 11, 12
- `.ai-swarm/AGENT_COORDINATION.md`
- all completed agent reports for WP-005 through WP-012
- app/service run instructions discovered by implementation agents

## Allowed files

- E2E/smoke test files in the repo's existing test locations
- Playwright/browser smoke harnesses if the repo already uses them
- docs under `.ai-swarm/` for demo proof
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`

## Prohibited files

- Core feature implementation except tiny testability fixes approved by the Integrator
- Secrets or real customer data
- Real outbound CRM/Plane/DigitalOcean calls
- LEXOS/legal vertical work

## Dependencies

- Start last, after WP-005 through WP-012 are complete enough for an integrated run.

## Tasks

1. Boot the required local services/apps using documented commands.
2. Submit or seed a lead input for `websitefactory.lead_to_preview`.
3. Drive the run through all stages, using documented approval/default behavior.
4. Verify a reachable `preview_url` renders generated copy and placeholder/media plan.
5. Assert minimum audit events from `CONTRACTS_MVO.md` §8 and stage trace from §10.
6. Assert `PreviewOutput` contains `run_id`, `preview_url`, `preview_artifact_ref`, `lease_ids`, `workflow_run_ids`, and `audit_event_ids`.
7. Save proof in the agent report with command output, screenshots/trace paths if available, and blockers.

## Acceptance criteria

- Demo path completes or reaches a documented MVO-acceptable stub/approval state.
- Every unacceptable stub condition is avoided: audit event, capability lease, memory/event write, and trace visibility are present.
- Browser/UI or API proof shows preview URL and trace/status surface.
- Failures are mapped to canonical error codes if the demo cannot complete.

## Required proof

- Commands run and outputs.
- Screenshot path or trace output if UI is involved.
- Audit event IDs and run ID from the demo.
- Clear pass/fail summary.

## Out of scope

New product features, broad refactors, production deployment, external paid integrations.
