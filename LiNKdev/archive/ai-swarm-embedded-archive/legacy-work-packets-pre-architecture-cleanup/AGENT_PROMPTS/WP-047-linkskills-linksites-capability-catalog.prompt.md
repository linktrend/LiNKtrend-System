# WP-047 Agent Prompt - LinkSkills LinkSites Capability Catalog

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-047-linkskills-linksites-capability-catalog.md`.

## Current baseline

WP-040 through WP-045 are integrated into `origin/development`, and WP-043 defines the connector-only capability contracts in `CONTRACTS_MVO.md` section `0.A.5.1`. Branch from the latest `origin/development`.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-047-linkskills-linksites-capability-catalog`
5. Commit with message `feat: add LinkSites capability catalog entries`
6. `git push -u origin dev/codex/WP-047-linkskills-linksites-capability-catalog`

## Required reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `.cursor/rules/08-database-and-api-standards.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/WORK_PACKETS/WP-047-linkskills-linksites-capability-catalog.md`

## Mission

Extend LinkSkills safe-mode capability catalog support for the seven LinkSites v2 capability plugins. The goal is governed permission/lease readiness, not real connector side effects.

## Hard boundaries

- No real external writes.
- No Odoo chart of accounts, CRM stages, Payload schema, Supabase schema, Zulip stream taxonomy, or Plane workspace design.
- Live mode must remain disabled by default.
- Every side-effecting capability must be lease-gated and idempotent.

## Proof required

Run relevant LinkSkills tests and record exact command output summary in `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`.
