# WP-093 Agent Prompt - LinkSites Template Registry Hookup

Recommended model/tool: Cursor Kimi K2.5 or Gemini 3.1 Pro. Use Gemini 3 Flash only if doing discovery/spec without code.

Execute `.ai-swarm/WORK_PACKETS/WP-093-linksites-template-registry-discovery.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-093 -b dev/cursor/WP-093-linksites-template-registry-discovery origin/development
cd ../LiNKtrend-System-WP-093
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.ai-swarm/LINKSITES_COMPLETION_PLAN.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/WORK_PACKETS/WP-042-linksites-template-payload-discovery.md`
- `.ai-swarm/WORK_PACKETS/WP-093-linksites-template-registry-discovery.md`
- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/manifest.ts`
- `LiNKaios/linkaios-web/src/lib/kernel/dispatch.ts`
- `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/registry.ts` if present

## Mission

Surface the existing LinkSites template registry to the Website Builder reasoning path without modifying the LinkSites repo. This is connector/discovery work only.

## Current-State Reconciliation

`WP-090`, `WP-091`, and `WP-092` overlap with work already advanced by WP-071. This packet must not edit `LiNKautowork/gateway/src/workflows/linksites-v2.ts`. Focus on template registry discovery and validation in LiNKaios/WebsiteFactory plugin surfaces.

## Scope

Allowed:

- Add a small template registry discovery helper in `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/` or nearby existing pattern.
- Validate known template IDs against discovered/static registry data.
- Feed available template IDs into WebsiteFactory/LinkSites stage inputs if the existing dispatch path supports it.
- Add focused tests.
- Update `.ai-swarm/AGENT_REPORTS/integration-agent.md`.

Hard boundaries:

- Do not modify `/Users/linktrend/Projects/LiNKsites`.
- Do not invent template schemas if registry cannot be read; use a documented adapter interface and blocker.
- Do not implement UI.

## Proof Required

- Focused tests for template discovery/validation.
- If external registry path is unavailable, a report explaining the exact path checked and fallback used.
- Report branch, commit SHA, proof, and blockers.

## Finish

Commit message: `feat: add LinkSites template registry discovery`
Push branch to GitHub.
