# WP-112 Agent Prompt - LiNKapps Capability Plugin Contracts

Use Cursor Composer for this packet. Do not use Kimi, Codex, Gemini, or Antigravity unless the orchestrator changes this assignment.

Execute `.ai-swarm/WORK_PACKETS/WP-112-linkapps-capability-plugin-contracts.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-112 -b dev/cursor/WP-112-linkapps-capability-plugin-contracts origin/development
cd ../LiNKtrend-System-WP-112
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `plugins/vertical/linkapps/manifest.yaml`
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.5 and §0.A.5.1
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-112-linkapps-capability-plugin-contracts.md`

## Mission

Create declaration-only capability plugin contract manifests for LiNKapps app-factory operations.

## Hard Boundaries

- No implementation of live providers.
- No secrets, tokens, project IDs, account IDs, or tenant credentials.
- No real GitHub, Supabase, Stripe, Vercel, EAS, Plane, or Zulip writes.
- No LinkSkills runtime/service edits.

## Proof Required

- Manifest file listing.
- `rg` proof that no manifest declares live write authority by default.
- Example manifest excerpt in the report.
- Update `.ai-swarm/AGENT_REPORTS/WP-112-linkapps-capability-plugin-contracts.md`.

## Finish

Commit message: `docs: add LiNKapps capability contracts`
Push branch to GitHub.
