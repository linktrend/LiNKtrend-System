# WP-054 Agent Prompt - Odoo CRM And Accounting Capability Discovery Scaffold

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-054-odoo-crm-accounting-capability-discovery-scaffold.md`.

## Current baseline

Odoo is needed for CRM and Accounting across Linktrend verticals and separately for LEXOS later. `/Users/linktrend/Desktop/Odoo` is guidance context only; do not configure Odoo.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-054-odoo-crm-accounting-capability-discovery-scaffold`
5. Commit with message `docs: scaffold Odoo CRM and accounting capabilities`
6. `git push -u origin dev/codex/WP-054-odoo-crm-accounting-capability-discovery-scaffold`

## Required reading

- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `/Users/linktrend/Desktop/Odoo`
- `.ai-swarm/WORK_PACKETS/WP-054-odoo-crm-accounting-capability-discovery-scaffold.md`

## Mission

Use the Odoo guidance folder to scaffold a governed capability family with separated CRM and Accounting surfaces. Do not create Odoo business configuration.

## Hard boundaries

- No live Odoo writes.
- No chart of accounts, CRM stages, taxes, journals, or business records.
- No secrets.

## Proof required

Record guidance files read, changed files, and any test proof in the relevant agent report.
