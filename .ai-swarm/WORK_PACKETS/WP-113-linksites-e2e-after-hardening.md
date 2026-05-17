# WP-113 - LinkSites E2E Harness After Hardening

## Objective

Update the LinkSites development-mode E2E harness and runbook after the WP-090 through WP-093 hardening work, proving the flow reaches the strict preview readiness and CRM gate when configured with deterministic local/mock inputs.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-113-linksites-e2e-after-hardening`
- Base: `origin/development`

## Allowed files

- `scripts/**`
- `apps/linkaios-web/src/**` only for harness fixtures/support
- `LiNKautowork/gateway/src/**` only for test fixture support, not workflow behavior
- `.ai-swarm/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`
- `.ai-swarm/AGENT_REPORTS/WP-113-linksites-e2e-after-hardening.md`

## Prohibited files

- No live outreach
- No VPS/public deployment
- No production Supabase/Payload/Odoo/Postiz configuration
- No weakening WP-092 fail-closed readiness behavior

## Required context

- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/END_OF_DAY_VERIFICATION_QUEUE.md`
- `scripts/run-e2e.ts` or current E2E harness
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`

## Steps

1. Inspect the current E2E harness and adapt it to the hardened artifact, Supabase mirror, Payload sync, preview readiness, and CRM gate behavior.
2. Use deterministic dev/mock/local inputs only.
3. Assert trace refs: lease IDs, workflow run IDs, audit event IDs, artifact refs, sync refs, readiness report refs, and CRM status.
4. Preserve fail-closed behavior; if local Payload/Supabase are absent, report the canonical expected blocker instead of forcing success.
5. Update the demo runbook with the exact command and expected outputs.
6. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- E2E harness reflects WP-090 through WP-093 hardened behavior.
- Harness either passes in deterministic dev mode or produces a precise canonical blocker.
- Runbook contains exact command and expected proof.
- No live external writes are attempted.

## Proof required

- Passing E2E command output, or exact canonical blocker output.
- Runbook diff summary.
- Evidence no production config/secrets were introduced.
