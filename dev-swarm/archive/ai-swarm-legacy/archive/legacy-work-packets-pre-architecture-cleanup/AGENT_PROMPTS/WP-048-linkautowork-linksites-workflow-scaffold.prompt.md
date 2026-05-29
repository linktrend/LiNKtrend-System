# WP-048 Agent Prompt - LiNKautowork LinkSites Workflow Scaffold

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-048-linkautowork-linksites-workflow-scaffold.md`.

## Current baseline

WP-040 through WP-045 are integrated into `origin/development`. WP-045 defines the deterministic workflow handles in `CONTRACTS_MVO.md` section `0.A.10.1`. Branch from the latest `origin/development`.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-048-linkautowork-linksites-workflow-scaffold`
5. Commit with message `feat: scaffold LinkSites deterministic workflows`
6. `git push -u origin dev/codex/WP-048-linkautowork-linksites-workflow-scaffold`

## Required reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/04-mvo-scope-and-stubbing.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/WORK_PACKETS/WP-048-linkautowork-linksites-workflow-scaffold.md`

## Mission

Implement development-mode deterministic workflow scaffolds for the five LinkSites v2 handles. Keep the behavior local, idempotent, lease-aware, and auditable.

## Hard boundaries

- No VPS/DigitalOcean deployment.
- No real Payload/Odoo/Plane/Zulip/provider writes.
- No invented Payload or Supabase schema.
- Missing lease must fail closed for write handles.

## Proof required

Run relevant LiNKautowork gateway tests and record exact command output summary in `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`.
