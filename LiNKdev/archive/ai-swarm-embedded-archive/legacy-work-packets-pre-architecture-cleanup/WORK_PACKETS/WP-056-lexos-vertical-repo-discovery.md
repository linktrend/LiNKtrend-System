# WP-056 - LEXOS vertical repo discovery

## Objective

Discover the existing LEXOS vertical work in `/Users/linktrend/Projects/LiNKtrend-LEXOS` and report what can be reused when converting LEXOS Litigation into a LiNKaios vertical plugin.

## Repo / branch

- Coordination repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Discovery target: `/Users/linktrend/Projects/LiNKtrend-LEXOS`
- Branch: `dev/codex/WP-056-lexos-vertical-repo-discovery`

## Allowed files

- `.ai-swarm/LEXOS_VERTICAL_DISCOVERY.md`
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`
- `.ai-swarm/REPO_INVENTORY.md` only if adding discovered repo facts

## Prohibited files

- Do not edit `/Users/linktrend/Projects/LiNKtrend-LEXOS`.
- Do not implement LEXOS code.
- Do not move LEXOS into the monorepo.
- Do not define legal workflows beyond evidence found in the repo.

## Required context

- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.ai-swarm/PLUGIN_ARCHITECTURE_V2.md`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS`
- `.ai-swarm/WORK_PACKETS/WP-056-lexos-vertical-repo-discovery.md`

## Steps

1. Inspect repo structure, package/workspace files, docs, app/service folders, schemas, workflows, agents, and tests.
2. Identify existing litigation vertical concepts, data models, workflows, UI, integrations, and reusable code.
3. Identify likely vertical plugin boundaries, LiNKbot roles, capability dependencies, and hard unknowns.
4. Record what must be copied/adapted versus deferred.
5. Update discovery doc and agent report with evidence paths and proof.

## Acceptance criteria

- Discovery is evidence-based with exact file paths.
- No legal workflow is invented without repo evidence.
- Output is enough for the Integrator to write later LEXOS work packets.

## Proof required

- Commands/searches run.
- `git -C /Users/linktrend/Projects/LiNKtrend-LEXOS status --short` result showing no edits by the discovery agent.
