# WP-090 Agent Prompt - LinkSites Local Artifact Storage

Recommended model/tool: Codex only if credits allow and the user explicitly wants to spend one Codex slot. Otherwise use Cursor Kimi K2.5 or Gemini 3.1 Pro. Do not use Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-090-linksites-autowork-artifact-storage.md`, but reconcile with the current post-WP-071 implementation before editing.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-090 -b dev/codex/WP-090-linksites-autowork-artifact-storage origin/development
cd ../LiNKtrend-System-WP-090
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/LINKSITES_COMPLETION_PLAN.md`
- `.ai-swarm/WORK_PACKETS/WP-090-linksites-autowork-artifact-storage.md`
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md` WP-071 section
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`
- `LiNKautowork/gateway/src/workflows/linksites-v2.test.ts`
- `LiNKautowork/gateway/src/index.ts`

## Mission

Complete the existing `autowork.linksites.artifact_write_local` handler so it writes a real deterministic local artifact bundle in development mode instead of only recording an in-memory stub.

## Current-State Reconciliation

WP-071 already added `ARTIFACT_WRITE_LOCAL_HANDLE` and a handler in `LiNKautowork/gateway/src/workflows/linksites-v2.ts`. Do not create a duplicate workflow module under a different app path unless the current project already uses that pattern. Improve the existing gateway implementation.

## Scope

Allowed:

- Add a small local artifact writer helper under `LiNKautowork/gateway/src/lib/` if useful.
- Update `LiNKautowork/gateway/src/workflows/linksites-v2.ts`.
- Update or add focused tests under `LiNKautowork/gateway/src/`.
- Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`.

Hard boundaries:

- Development mode only. Do not add cloud storage.
- Do not write generated artifacts to Git repos.
- Do not bypass idempotency behavior.
- Do not change Supabase/Payload/CRM handlers beyond what is required to pass shared tests.
- Do not use production credentials.

## Required Behavior

- Inputs must include `site_id`, `site_generation_run_id`, `artifact_bundle_ref`, `artifact_root_path`, and `idempotency_key`.
- Write under `artifact_root_path` using a deterministic tenant/run/site directory layout.
- Persist a manifest file that includes at least tenant/run/site IDs, `artifact_bundle_ref`, written file list, digest, and created timestamp.
- Return `artifact_ref`, `artifact_manifest_ref`, `artifact_root_path`, `written_files_count`, and `artifact_digest`.
- Re-invocation with the same idempotency key must return the same workflow result via existing workflow idempotency.
- Fail safely on path traversal or invalid artifact root input.

## Proof Required

- `pnpm --filter @linktrend/autowork-gateway test -- src/workflows/linksites-v2.test.ts`
- Add/extend tests that assert a manifest file is actually written to a temp directory.
- Report changed files, commands run, proof, blockers, branch, and commit SHA.

## Finish

Commit message: `feat: persist LinkSites local artifacts`
Push branch to GitHub.
