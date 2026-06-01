# WP-120 - LinkSites Local Proof Runbook and Preflight

## Objective

Turn the remaining LinkSites E2E environment blocker into an actionable local proof path with preflight checks, safe local-only guidance, and no production credentials.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-120-linksites-local-proof-runbook-and-preflight`
- Base: `origin/development`

## Allowed files

- `scripts/run-e2e.ts`
- `scripts/**e2e**`
- `.env.example`
- `.ai-swarm/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`
- `.ai-swarm/END_OF_DAY_VERIFICATION_QUEUE.md`
- `.ai-swarm/AGENT_REPORTS/WP-120-linksites-local-proof-runbook-and-preflight.md`

## Prohibited files

- No real production secrets.
- No live outreach, public publishing, or VPS deployment.
- No weakening fail-closed behavior.
- No changes to kernel business behavior unless needed for preflight-only diagnostics.

## Required context

- `.ai-swarm/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`
- `.ai-swarm/END_OF_DAY_VERIFICATION_QUEUE.md`
- `scripts/run-e2e.ts`
- `.env.example`

## Steps

1. Add or refine E2E preflight checks for required local variables and reachable local app endpoint.
2. Document exact safe local env setup using placeholders only.
3. Keep missing config as `E2E_CONFIG_MISSING` and app-unreachable as canonical dispatch/config blocker.
4. Update the end-of-day verification queue with the exact local proof command and screenshot targets.
5. Run preflight without secrets and confirm safe failure.
6. Update the packet-specific report.

## Acceptance criteria

- A developer can see exactly what local-only config is required before running E2E.
- Running without config fails before network/DB writes.
- EOD proof queue is actionable and does not require production credentials.

## Proof required

- `pnpm run test:mvo:e2e` output showing expected safe preflight failure without local config.
- Runbook diff summary.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
