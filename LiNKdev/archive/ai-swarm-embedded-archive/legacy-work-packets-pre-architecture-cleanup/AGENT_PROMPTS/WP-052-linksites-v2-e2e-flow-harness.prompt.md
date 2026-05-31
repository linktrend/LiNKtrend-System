# WP-052 Agent Prompt - LinkSites V2 E2E Flow Harness

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-052-linksites-v2-e2e-flow-harness.md`.

## Dependency gate

Start only after WP-049, WP-050, and WP-051 are integrated into `origin/development`.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-052-linksites-v2-e2e-flow-harness`
5. Commit with message `test: add LinkSites v2 E2E harness`
6. `git push -u origin dev/codex/WP-052-linksites-v2-e2e-flow-harness`

## Required reading

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-052-linksites-v2-e2e-flow-harness.md`
- Existing `scripts/run-e2e.ts`

## Mission

Create the repeatable v2 development-mode E2E harness and prove trace refs, readiness, and CRM `ready_to_contact`.

## Hard boundaries

- No live outreach, VPS deployment, or live external writes.

## Proof required

Record exact E2E command output or canonical blocker in `.ai-swarm/AGENT_REPORTS/integration-agent.md`.
