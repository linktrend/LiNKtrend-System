# WP-109 Agent Prompt - LiNKapps LiNKautowork Workflow Pack

Recommended model/tool: Cursor Kimi or Gemini 3.1 Pro for coding. This is the best candidate for the single Codex slot only if the orchestrator explicitly approves spending Codex credits. Do not use Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-109-linkapps-autowork-workflow-pack.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-109 -b dev/cursor/WP-109-linkapps-autowork-workflow-pack origin/development
cd ../LiNKtrend-System-WP-109
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `plugins/vertical/linkapps/manifest.yaml`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `.ai-swarm/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`
- `.ai-swarm/LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts`
- `.ai-swarm/WORK_PACKETS/WP-109-linkapps-autowork-workflow-pack.md`

## Mission

Create deterministic development-mode LiNKautowork workflow hooks for the 7 Linkapps Phase 5 stages.

## Hard Boundaries

- No real GitHub, Supabase, Stripe, Vercel, EAS, Plane, or Zulip writes.
- No production deployment.
- Do not edit `plugins/vertical/linkapps/manifest.yaml`.
- Do not implement provider clients beyond local/mock deterministic stubs.

## Proof Required

- Relevant `@linktrend/autowork-gateway` test output.
- File/handle listing for the 7 workflow hooks.
- Confirmation no live provider client was introduced.
- Update `.ai-swarm/AGENT_REPORTS/WP-109-linkapps-autowork-workflow-pack.md`.

## Finish

Commit message: `feat: add LiNKapps workflow pack`
Push branch to GitHub.
