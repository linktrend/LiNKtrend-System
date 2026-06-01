# Technology stack

LiNKtrend-System monorepo — **LiNKaios** (Client + Admin). Gates read this file for tier B smoke and architecture checks.

**MVO requires:** Supabase, Zulip, Plane integration, LiNKbot runtime, LiNKautowork gateway — see [`CONSTRAINTS.md`](CONSTRAINTS.md).

## Languages

- TypeScript / Node.js
- Shell (LiNKdev scripts, deploy helpers)
- SQL (Supabase migrations)

## Package managers

| Tool | Version pin | Notes |
|------|-------------|-------|
| pnpm | 10.26.1 | Root `packageManager`; Turborepo monorepo |
| npm | N/A | Not primary |

## Key paths

| Area | Path |
|------|------|
| LiNKaios Client (primary app) | `LiNKaios/linkaios-web/` |
| LiNKtrend Admin | `LiNKaios/linkaios-web/` (vendor routes/shell — same deployable) |
| Shared packages | `packages/` |
| LinkSkills connectors | `LiNKskills/capability-connectors/` |
| LinkSites Suite map | `suites/linksites/` |
| Bot runtime adapter | `LiNKbot/runtime-adapters/openclaw/bot-runtime` |
| Migrations | `services/migrations/` |
| LiNKdev factory | `LiNKdev/factory/` (not modified by product grounding passes) |

## External repos (MVO)

| Repo | Role |
|------|------|
| `/Users/linktrend/Projects/LiNKsites` | Payload, templates, frontend, publish |
| `/Users/linktrend/Projects/LiNKbot-core` | Bot engine fork |
| `/Users/linktrend/Projects/LiNKautowork` | n8n fork (workflows execute via gateway) |

## Verify commands

| Gate | Command | Expected |
|------|---------|----------|
| integration_smoke | `pnpm --filter @linktrend/linkaios-web test` | Exit 0 |
| architecture_gate (JS/TS) | `pnpm typecheck` | Exit 0 |

## Integration smoke

```bash
pnpm --filter @linktrend/linkaios-web test
```

Fallback: `pnpm typecheck` at repo root.

## Notes

- Turborepo from repository root
- Secrets via GSM at runtime — see `.env.example` for names only
- Update this file when primary app path or verify commands change
