# PWR-W0 — Integrator baseline commit

## Objective
Commit and push all existing WIP (terminology T1–T4, suites routes, wizard, project tabs fix) to `development` before new waves.

## Branch
`development` (direct integrator commit)

## Pre-check
```bash
git status --short --branch
cd LiNKaios/linkaios-web && npm run typecheck
```

## Steps
1. Review diff — exclude secrets, binaries, `.env`
2. Bisect commits logically if needed:
   - `feat(suites): route rename and suite profile tabs`
   - `feat(projects): add-project wizard with suite picker table`
   - `chore(ui): terminology waves T1-T4`
   - `fix(projects): map cycles tab to runs`
   - `chore(cursor): ui skills and terminology rule`
3. Push `development`
4. Record SHAs in `dev-swarm/reports/legacy-ai-swarm/PWR-W0-baseline.md`

## Prohibited
- Force push
- Committing `.env` or secrets

## Acceptance
- [ ] Clean working tree (except documented excludes)
- [ ] typecheck passed before commit
- [ ] development pushed to origin

## Report
`dev-swarm/reports/legacy-ai-swarm/PWR-W0-baseline.md`
