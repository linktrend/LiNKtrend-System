# WP-209 — LiNKguard Rename And Sidecar Hardening

## Objective

Harden LiNKguard after the repo cleanup: package name, Dockerfile, compose service, residue policy tests, README/source references, and LiNKaios settings labels must no longer depend on PRISM/prism-defender active paths.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-209-linkguard-rename-hardening`
- Branch: `wp-209-linkguard-rename-hardening`

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.

## Allowed Files

- `LiNKguard/`
- `deploy/docker/linkguard.Dockerfile`
- `docker-compose.linktrend.yml`
- LiNKguard labels/settings in `LiNKaios/linkaios-web/`
- Related docs/rules
- `LiNKdev/product/reports/archive/legacy-ai-swarm/`

## Prohibited Files

- External repos
- Reintroducing `prism-defender` as an active path or package name
- Removing archived historical PRISM references where clearly historical

## Required Context

- `docs/architecture/repo-architecture-target.md`
- `docs/architecture/system-completion-targets.md`
- `LiNKguard/README.md`
- `.cursor/rules/01-ecosystem-boundaries.mdc`

## Steps

1. Search active code/config for PRISM/prism-defender path/package drift.
2. Fix active references to use LiNKguard/linkguard naming.
3. Verify Docker/compose package filters point to `@linktrend/linkguard`.
4. Ensure LiNKaios settings labels reflect LiNKguard while preserving historical docs as history.
5. Run LiNKguard typecheck/test.

## Acceptance Criteria

- No active package/config path depends on `LiNKguard/sidecar/prism-defender`.
- LiNKguard package builds/tests under `@linktrend/linkguard`.
- Historical PRISM wording is either archived or clearly described as former naming.

## Proof Required

- `pnpm --filter @linktrend/linkguard typecheck`
- `pnpm --filter @linktrend/linkguard test`
- Search output summary for active PRISM/prism-defender references

## Report File

Update `LiNKdev/product/reports/archive/legacy-ai-swarm/WP-209-linkguard-rename-hardening.md`.
