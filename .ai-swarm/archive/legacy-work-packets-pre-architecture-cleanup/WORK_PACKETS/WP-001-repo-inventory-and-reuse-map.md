# WP-001 — Repo inventory and reuse map

## Objective

Produce a **factual inventory** of this repository and a **reuse map** that accelerates the **LinkSites / WebsiteFactory lead-to-preview-site** MVO without violating `ARCHITECTURE_RULES.md`.

## Tasks

1. Enumerate top-level apps/packages/services relevant to LinkSites, WebsiteFactory, preview hosting, and bot/runtime paths.
2. Identify **known entrypoints** (CLIs, apps, packages) and **dependencies between them** at a high level.
3. Flag **legacy / archived / duplicate** implementations (e.g., multiple bot or engine trees) with paths and a one-line risk note.
4. Recommend **reuse first** options for template sources, preview strategies, and orchestration hooks — explicitly call out what must **not** be duplicated per plane boundaries.

## Acceptance criteria

- [ ] `REPO_INVENTORY.md` is filled so another agent can navigate the repo in <15 minutes.
- [ ] Reuse map lists **at least five** concrete paths (files or dirs) with “use / avoid / investigate” tags.
- [ ] Open questions that block contracts are listed and mirrored to `AGENT_COORDINATION.md` → **Open Questions** (or filed as rows in `DECISIONS.md` if they are true forks).

## Required proof

- Link to updated `REPO_INVENTORY.md` sections in the agent report **Files Changed**.
- Summarize commands used (e.g., `find`, `rg`, tree) under **Commands Run** (no secrets).

## Out of scope

Changing application code, adding dependencies, or editing lockfiles.
