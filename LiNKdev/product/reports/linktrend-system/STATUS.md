# Program STATUS: linktrend-system

**Phase:** `running` — **MVO NOT complete** (honest reset 2026-06-01)  
**Planner:** G1/G2 council PASS at program start; intent verdict PASS  
**Alignment:** Issue graph valid; **SHIP_CRITERIA.md unchecked**  
**Issues:** 31 total — **21 done** (waves 1–8 with individual PRs + linkdev:done), **10 reopened** after PR #95 audit  

## Why reset

PR #95 marked LTS-033 through LTS-900 `done` in STATE with `phase: complete` while:

- CI **build-test failed** on `development` (`@linktrend/bot-runtime` TS errors; linkaios-web import paths)
- GitHub issues **#24–#29, #33–#37, #40–#41, #46** lack `linkdev:done`
- **SHIP_CRITERIA.md** — zero checklist items satisfied
- **Wave 6 council checkpoint** — not recorded (G1/G2 only)
- LTS-103 used **invented** template IDs (`professional_v1`, `minimal_v1`) not LiNKsites registry

## Council status

| Checkpoint | Gate | Status |
|------------|------|--------|
| Program start | G1 | PASS — `LiNKdev/product/reports/linktrend-system/council/G1-report.json` |
| After planner Q&A | G2 | PASS — `LiNKdev/product/reports/linktrend-system/council/G2-report.json` |
| After wave 2 | G3 (per PROGRAM.md schedule) | **NOT RUN** — schedule says `after_wave: 2`; only G1/G2 on file |
| After wave 6 | G3/G4 | **NOT RUN** — required before continuing past wave 6 |

**Action:** Run `validate-council.sh` on a fresh wave-6 report before advancing LTS-104+.

## Done (verified individual PRs, linkdev:done on GitHub)

LTS-001–032, LTS-040–042, LTS-050, LTS-060, LTS-101, LTS-102

## In flight

| Issue | STATE | Next |
|-------|-------|------|
| LTS-103 | review_ready | Reviewer → integrator merge after CI green |
| LTS-033 | ready | Parallel executor — separate PR after LTS-103 or concurrent |

## Remaining backlog (DAG order)

1. **LTS-103** — template selection (this session — executor complete)  
2. **LTS-033** → LTS-034 → LTS-043 (autowork + outreach bot gates)  
3. **LTS-104** → LTS-105 → LTS-106 → LTS-107 (LinkSites build → publish → outreach → close)  
4. **LTS-108** — E2E demo + STATUS demo section  
5. **LTS-900** — critical verify + SHA256 (only when shippable)  

## Principal Q&A (binding)

| ID | Answer | Summary |
|----|--------|---------|
| D1 | B | Governed mock lead |
| D2 | A | Governed draft-only outreach |
| D3 | B | Full Librarian loop + world brain |
| D4 | B | Full Admin vendor catalogue |

## Parallel dispatch (DAG cap 10)

| Metric | Value |
|--------|-------|
| **Eligible now** | **2** — LTS-033, LTS-103 (deps satisfied, not `linkdev:done`) |
| **Executing** | LTS-103 executor on `issue/LTS-103-template-selection-external-registry`; build-fix import paths uncommitted |
| **Next parallel pair** | LTS-034 + LTS-104 after 033 + 103 integrator merge |
| **Remaining** | 10 issues (033–034, 043, 103–108, 900) — 900 blocked until 108 |

## Verify (current session)

```bash
pnpm build                                    # 14/14 packages — PASS with linkaios import fix (uncommitted on development)
pnpm dlx vitest run suites/linksites/phases/template-selection/template-selection.test.ts --root .
cd LiNKaios/linkaios-web && npm test -- src/lib/linksites-template-selection.test.ts
cd LiNKautowork/gateway && npm test -- src/workflows/linksites-v2.test.ts
LINKDEV_SCOPE=suites/linksites LiNKdev/factory/scripts/verify.sh
```

## Release

**Blocked.** Principal Release OK required before staging/main. LTS-900 not started.
