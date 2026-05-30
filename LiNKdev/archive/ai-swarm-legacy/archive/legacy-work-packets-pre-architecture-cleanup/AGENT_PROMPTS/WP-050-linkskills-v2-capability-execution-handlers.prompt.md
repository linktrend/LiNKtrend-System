# WP-050 Agent Prompt - LinkSkills V2 Capability Execution Handlers

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-050-linkskills-v2-capability-execution-handlers.md`.

## Current baseline

WP-047 added LinkSites v2 capability catalog entries. Branch from latest `origin/development`.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-050-linkskills-v2-capability-execution-handlers`
5. Commit with message `feat: add LinkSites capability execution handlers`
6. `git push -u origin dev/codex/WP-050-linkskills-v2-capability-execution-handlers`

## Required reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/WORK_PACKETS/WP-050-linkskills-v2-capability-execution-handlers.md`

## Mission

Implement mock/shadow-safe execution handlers for the LinkSites v2 capability set. Preserve leases, idempotency, kill switches, audit, and canonical failure mapping.

## Hard boundaries

- No real external writes.
- No Odoo/Payload/Supabase/Zulip/Plane business setup.
- No bypassing LinkSkills governance.

## Proof required

Run relevant LinkSkills tests and typecheck. Record proof in `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`.
