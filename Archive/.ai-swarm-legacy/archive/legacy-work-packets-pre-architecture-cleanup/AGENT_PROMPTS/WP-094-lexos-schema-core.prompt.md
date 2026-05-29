# WP-094 Agent Prompt - LEXOS Core Schema Adaptation

Recommended model/tool: Cursor Kimi K2.5 or Gemini 3.1 Pro. This is schema adaptation work; do not use Codex unless the user explicitly spends remaining Codex budget. Do not use Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-094-lexos-schema-core.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-094 -b dev/cursor/WP-094-lexos-schema-core origin/development
cd ../LiNKtrend-System-WP-094
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-094-lexos-schema-core.md`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/supabase/migrations/20260511000002_identity_intake_clients_matters.sql`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/supabase/migrations/20260511000003_evidence_and_extractions.sql`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/supabase/migrations/20260511000004_assertions_support_risks.sql`

## Mission

Copy and adapt LEXOS core identity/evidence/assertion schema into LiNKaios plugin schema files without modifying the source LEXOS repo and without moving real data.

## Scope

Allowed:

- Create `packages/linkaios-db/migrations/lexos/*.sql`.
- Create `packages/linkaios-db/schemas/lexos/*.sql`.
- Update `.ai-swarm/DECISIONS.md` only for real adaptation decisions.
- Update the most appropriate agent report (`integration-agent.md` unless a LEXOS-specific report exists).

Hard boundaries:

- Do not modify `/Users/linktrend/Projects/LiNKtrend-LEXOS`.
- Do not move actual LEXOS data.
- Do not implement application code.
- Do not apply migrations to any database.
- Do not introduce production credentials or real client/legal data.

## Required Adaptations

- Preserve original LEXOS intent and table relationships where possible.
- Add `tenant_id` to plugin-owned tables.
- Prefix table names with `lexos_`.
- Update foreign key references after prefixing.
- Add/adjust RLS policies for tenant isolation.
- Keep schema files deterministic and reviewable.

## Proof Required

- File listing for created migration/schema files.
- Static evidence that adapted tables include `tenant_id`.
- Static evidence that adapted table names use `lexos_` prefix.
- Static evidence that source LEXOS repo was not modified (`git -C /Users/linktrend/Projects/LiNKtrend-LEXOS status --short` if it is a git repo; otherwise report exact reason).
- Report changed files, proof, blockers, branch, and commit SHA.

## Finish

Commit message: `docs: adapt LEXOS core schema`
Push branch to GitHub.
