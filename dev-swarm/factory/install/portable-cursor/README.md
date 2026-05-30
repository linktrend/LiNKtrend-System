# Portable `.cursor/` shim (copy with Dev Swarm)

When you copy `dev-swarm/` into a **new** repository, also install this thin `.cursor/` tree at the repo root.

## Install (wire session)

From repo root:

```bash
cp -R dev-swarm/factory/install/portable-cursor/.cursor ./
```

Then add **product-specific** rules under `.cursor/rules/` as `01-*.mdc` … `08-*.mdc` (this LiNKtrend repo is the reference implementation).

## What this shim contains

| Path | Purpose |
|------|---------|
| `rules/00-dev-swarm-bootstrap.mdc` | Always-on: read `dev-swarm/` first |
| `skills/README.md` | Points to `dev-swarm/skills/` |
| `agents/README.md` | Points to `dev-swarm/factory/agents/` |
| `commands/*.md` | Wire, Go, UI automations |

## What does NOT live here

- Skill bodies → `dev-swarm/skills/`
- Factory rules → `dev-swarm/factory/rules/`
- Product rules → `.cursor/rules/01`–`08` per product (LiNKtrend only in this repo)

Do not copy `mcp.json` from another repo unless you configure secrets locally.
