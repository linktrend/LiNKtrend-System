# WP-103 Agent Prompt - LEXOS Capability Manifests

Recommended model/tool: Cursor Gemini 3 Flash or Composer for manifest/spec work. Use Kimi only if more source tracing is needed. Do not use Codex or Antigravity.

Execute `.ai-swarm/WORK_PACKETS/WP-103-lexos-capability-manifests.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-103 -b dev/cursor/WP-103-lexos-capability-manifests origin/development
cd ../LiNKtrend-System-WP-103
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `.ai-swarm/CONTRACTS_MVO.md` §0.A.5
- `.ai-swarm/WORK_PACKETS/WP-103-lexos-capability-manifests.md`

## Mission

Create declaration-only capability plugin manifests for LEXOS-required capabilities. These manifests define governance and readiness surfaces only; they do not implement integrations.

## Scope

Allowed:

- Create files under `packages/linkaios-kernel/plugins/capabilities/lexos/`.
- Update `.ai-swarm/DECISIONS.md` only if a real manifest decision needs recording.
- Update `.ai-swarm/AGENT_REPORTS/integration-agent.md` or the most appropriate existing report if a LEXOS-specific report exists.

Hard boundaries:

- No capability implementation.
- No secrets or credentials.
- No live mode for MVO.
- Do not configure target legal software.
- Do not modify `/Users/linktrend/Projects/LiNKtrend-LEXOS`.

## Required Manifests

- `cap.storage.evidence`
- `cap.extraction.parser`
- `cap.extraction.ocr`
- `cap.extraction.qa`
- `cap.research.legal`

Each manifest must include:

- capability id and target software
- allowed operations
- auth requirements
- mode flags
- lease requirements
- idempotency rules
- audit events
- allowed callers
- failure mapping
- explicit `not_configured`

## Proof Required

- Manifest file listing.
- Confirmation no manifest declares `live` mode.
- One example manifest excerpt in the report.
- Report changed files, proof, blockers, branch, and commit SHA.

## Finish

Commit message: `docs: add LEXOS capability manifests`
Push branch to GitHub.
