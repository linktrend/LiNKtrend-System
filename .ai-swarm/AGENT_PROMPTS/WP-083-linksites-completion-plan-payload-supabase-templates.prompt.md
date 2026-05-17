# WP-083 Agent Prompt - LinkSites Completion Plan

Recommended model/tool: Cursor Gemini 3 Flash, Composer, or Cursor Gemini 3.1 Pro Low. Do not use Codex.

Execute `.ai-swarm/WORK_PACKETS/WP-083-linksites-completion-plan-payload-supabase-templates.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-083 -b dev/cursor/WP-083-linksites-completion-plan-payload-supabase-templates origin/development
cd ../LiNKtrend-System-WP-083
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Mission

Create `.ai-swarm/LINKSITES_COMPLETION_PLAN.md` and follow-up packets defining what remains for LinkSites to be complete enough that future work is mostly industry template creation.

## Required Reading

- `.ai-swarm/WORK_PACKETS/WP-083-linksites-completion-plan-payload-supabase-templates.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-042-linksites-template-payload-discovery.md`
- `/Users/linktrend/Projects/LiNKsites`

## Finish

Commit message: `docs: define LinkSites completion plan`
Push branch and report branch, commit SHA, proof, and blockers.
