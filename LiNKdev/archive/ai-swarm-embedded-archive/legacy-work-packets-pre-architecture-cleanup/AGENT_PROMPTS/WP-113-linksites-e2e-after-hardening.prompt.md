# WP-113 Agent Prompt - LinkSites E2E Harness After Hardening

Use Cursor Kimi for this packet. Do not use Composer, Codex, Gemini, or Antigravity unless the orchestrator changes this assignment.

Execute `.ai-swarm/WORK_PACKETS/WP-113-linksites-e2e-after-hardening.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-113 -b dev/cursor/WP-113-linksites-e2e-after-hardening origin/development
cd ../LiNKtrend-System-WP-113
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/END_OF_DAY_VERIFICATION_QUEUE.md`
- `scripts/run-e2e.ts` or current E2E harness
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`
- `.ai-swarm/WORK_PACKETS/WP-113-linksites-e2e-after-hardening.md`

## Mission

Update the LinkSites development-mode E2E harness and runbook for the hardened WP-090 through WP-093 flow.

## Hard Boundaries

- No live outreach.
- No VPS/public deployment.
- No production Supabase/Payload/Odoo/Postiz configuration.
- Do not weaken WP-092 fail-closed readiness behavior.

## Proof Required

- Passing E2E command output, or exact canonical blocker output.
- Runbook diff summary.
- Evidence no production config/secrets were introduced.
- Update `.ai-swarm/AGENT_REPORTS/WP-113-linksites-e2e-after-hardening.md`.

## Finish

Commit message: `test: update LinkSites hardened E2E harness`
Push branch to GitHub.
