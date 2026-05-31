# Cursor configuration (LiNKtrend-System)

This folder is the **IDE shim** for LiNKdev. The portable factory lives in **`LiNKdev/`**.

## Copy to a new product repo

1. Copy entire **`LiNKdev/`** to the new repo root.
2. Install the portable shim:
   ```bash
   cp -R LiNKdev/factory/install/portable-cursor/.cursor ./
   ```
3. Add product-specific rules as `.cursor/rules/01-*.mdc` … `08-*.mdc` (optional — only what that product needs).
4. Run wire: Cursor command **Wire LiNKdev** or `LiNKdev/factory/install/WIRE-PROMPT.md`
5. Codex UI: command **LiNKdev UI automations**
6. **Go:** command **LiNKdev Go** (cloud Planner)

See `LiNKdev/factory/install/portable-cursor/README.md` and `LiNKdev/README.md`.

## This repo (LiNKtrend-System)

| Path | Role |
|------|------|
| `rules/00-linkdev-bootstrap.mdc` | Always on — read `LiNKdev/` first |
| `rules/01`–`08` | **LiNKtrend product** rules only (numbered) |
| `skills/README.md` | Pointer — skills are in `LiNKdev/skills/` |
| `agents/README.md` | Pointer — agents are in `LiNKdev/factory/agents/` |
| `mcp.json` | Local MCP config (not portable; configure per machine) |

## Product rules (`01`–`08`)

| # | File | Scope |
|---|------|--------|
| 01 | `01-identity.mdc` | LiNKtrend venture studio identity |
| 02 | `02-ecosystem-boundaries.mdc` | LiNKaios / LiNKbrain / LinkSkills / … ownership |
| 03 | `03-secrets-security.mdc` | GSM naming, no secrets in repo |
| 04 | `04-mvo-scope-and-stubbing.mdc` | LinkSites MVO and acceptable stubs |
| 05 | `05-security-cost-and-side-effects.mdc` | Capability leases, cost controls |
| 06 | `06-database-and-api-standards.mdc` | LiNKtrend Supabase/RPC patterns |
| 07 | `07-suite-project-terminology.mdc` | Suite / Module / Project / Phase / Issue |
| 08 | `08-linkaios-ui-standards.mdc` | **LiNKaios shell UI only** (not generic) |

Generic UI and frontend guidance for any LiNKdev repo: **`LiNKdev/factory/rules/08-ui-and-frontend-standards.mdc`**.

## Legacy docs

Former `.cursor/LEXOS_IMPORTED_SKILLS_POLICY.md` and `SKILLS_INSTALL_SUMMARY.md` are archived under `LiNKdev/archive/cursor-docs-legacy/`.
