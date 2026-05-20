# WP-092 Agent Prompt - LinkSites Preview Readiness and CRM Mark

Recommended model/tool: Cursor Kimi K2.5 or Gemini 3.1 Pro. Do not use Codex unless the user explicitly spends the preserved Codex budget. Do not use Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-092-linksites-frontend-preview-check.md`, but reconcile with the current post-WP-071/WP-090/WP-091 implementation before editing.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-092 -b dev/cursor/WP-092-linksites-frontend-preview-check origin/development
cd ../LiNKtrend-System-WP-092
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/LINKSITES_COMPLETION_PLAN.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/WORK_PACKETS/WP-092-linksites-frontend-preview-check.md`
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md` WP-071, WP-090, and WP-091 sections
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`
- `LiNKautowork/gateway/src/lib/payload-client.ts`
- `LiNKautowork/gateway/src/workflows/linksites-v2.test.ts`
- `LiNKautowork/gateway/src/lib/linksites-v2.integration.test.ts`
- `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/lib/payload-client.ts` if present
- `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/app/[lang]/[[...slug]]/page.tsx` if present

## Mission

Harden the existing `autowork.linksites.preview_readiness_check` and `autowork.linksites.crm_ready_to_contact_mark` handlers for deterministic readiness checking and fail-closed CRM promotion.

## Current-State Reconciliation

WP-071 already added these handlers in `LiNKautowork/gateway/src/workflows/linksites-v2.ts`. Do not create duplicate workflow modules under obsolete packet paths. Improve the current gateway implementation and tests.

## Scope

Allowed:

- Update `LiNKautowork/gateway/src/workflows/linksites-v2.ts`.
- Update `LiNKautowork/gateway/src/lib/payload-client.ts`.
- Add small deterministic check helpers under `LiNKautowork/gateway/src/lib/` if needed.
- Add or extend focused tests under `LiNKautowork/gateway/src/`.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`.

Hard boundaries:

- Do not implement custom UI.
- Do not modify `/Users/linktrend/Projects/LiNKsites`.
- Do not use production credentials.
- Do not loosen `lease_id` requirements for CRM status promotion.
- Do not edit artifact, Supabase mirror, or Payload sync handlers except to keep shared tests passing.

## Required Behavior

- `preview_readiness_check` accepts deterministic expected pages/navigation/content/media/provenance inputs and returns `checks_passed`, `failed_checks[]`, `check_report_ref`, and readiness status.
- If local Payload/frontend services are not configured, deterministic development fallback may remain, but it must fail when required checks are absent.
- `crm_ready_to_contact_mark` must require `lease_id`.
- `crm_ready_to_contact_mark` must fail if `checks_passed` is false.
- Readiness audit events must remain emitted for checked/failed outcomes.
- Existing workflow idempotency must remain intact.

## Proof Required

- `pnpm --filter @linktrend/autowork-gateway test -- src/workflows/linksites-v2.test.ts src/lib/linksites-v2.integration.test.ts`
- Report how readiness maps to the discovered LinkSites frontend/Payload path.
- Report changed files, proof, blockers, branch, and commit SHA.

## Finish

Commit message: `fix: harden LinkSites preview readiness checks`
Push branch to GitHub.
