# WP-054 - Odoo CRM and Accounting capability discovery scaffold

## Objective

Discover and scaffold the Odoo capability family for CRM and Accounting without configuring Odoo business internals.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-054-odoo-crm-accounting-capability-discovery-scaffold`

## Allowed files

- `.ai-swarm/**`
- `LiNKskills/services/logic-engine/**`
- `apps/linkaios-web/src/**` only for config/env placeholders or mock adapter registration
- `.env.example`

## Prohibited files

- Do not configure live Odoo.
- Do not create chart of accounts, CRM stages, taxes, journals, products, partners, or business records.
- Do not require Droplet credentials.
- Do not store or commit secrets.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `/Users/linktrend/Desktop/Odoo` as guidance context only, not as a target for edits
- `.ai-swarm/WORK_PACKETS/WP-054-odoo-crm-accounting-capability-discovery-scaffold.md`

## Steps

1. Read `/Users/linktrend/Desktop/Odoo` as guidance for how Linktrend intends to use Odoo.
2. Propose/scaffold one Odoo capability family with separate governed surfaces for CRM and Accounting:
   - CRM: lead read/status readiness for LinkSites and future verticals.
   - Accounting: future transaction/accounting readiness for admin verticals.
3. Keep CRM and Accounting permissions separate even if they share auth/readiness code.
4. Add mock/shadow-safe operation definitions, env placeholders, lease requirements, idempotency, audit events, and canonical failure mapping.
5. Do not implement live writes.
6. Update the relevant agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- Odoo CRM and Accounting surfaces are separated clearly.
- No Odoo business setup is invented.
- Development/shadow posture is explicit.
- LinkSites can depend on CRM readiness without inheriting accounting permissions.

## Proof required

- Evidence of guidance files read.
- Passing tests if code is changed; otherwise docs/report proof.
