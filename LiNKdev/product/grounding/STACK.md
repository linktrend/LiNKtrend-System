# Technology stack

LiNKtrend-System monorepo — primary product surface is **LiNKaios web** (Next.js). Gates read this file for tier B smoke and architecture checks.

## Languages

- node/typescript
- shell

## Package managers

| Tool | Version pin | Notes |
|------|-------------|-------|
| pnpm | 10.26.1 | Root `packageManager`; turbo monorepo |
| npm | N/A | Not primary |

## Key paths

| Area | Path |
|------|------|
| Primary app | `LiNKaios/linkaios-web/` |
| Shared UI / packages | `packages/` |
| LiNKaios kernel / API | `LiNKaios/` |
| LinkSkills connectors | `LiNKskills/capability-connectors/` |
| Modules (tenant workflows) | `modules/` |
| Tests (app) | `LiNKaios/linkaios-web/` (vitest) |
| Repo root scripts | `package.json`, `turbo.json` |

## Verify commands

Commands LiNKdev gates may invoke (non-zero exit fails the gate):

| Gate | Command | Expected |
|------|---------|----------|
| integration_smoke | `pnpm --filter @linktrend/linkaios-web test` | Exit 0 |
| architecture_gate (JS/TS) | `pnpm typecheck` | Exit 0 |

## Integration smoke

Default command for tier B `integration_smoke`:

```bash
pnpm --filter @linktrend/linkaios-web test
```

Fallback when app tests are skipped: `pnpm typecheck` at repo root.

## Architecture gate (JS/TS only)

Canonical command for this repo:

```bash
pnpm typecheck
```

Per-app override:

```bash
pnpm --filter @linktrend/linkaios-web typecheck
```

## Notes

- Monorepo orchestration via Turborepo; run root commands from repository root.
- Do not store secrets here; reference env var names only (GSM at runtime).
- Update when primary app path or canonical test/typecheck commands change.
