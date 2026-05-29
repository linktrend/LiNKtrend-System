# PWR-W7 — Integrator proof + handoff

## Objective
Verify pre-wiring readiness; produce proof bundle and handoff doc.

## Branch
Work on `development` after all Wave 6 merges

## Steps
1. Pull latest `development`
2. Run proof suite:
   ```bash
   cd LiNKaios/linkaios-web && npm run typecheck && npm run build
   ```
3. Manual flow checklist (document in report):
   - Add Project wizard → detail (no 404)
   - Projects empty state CTAs
   - Settings stub badges visible
   - Suite terminology spot check
   - shadcn primitives importable
4. Write `docs/handoffs/YYYY-MM-DD-development-pre-wiring-readiness.md`
5. Update `dev-swarm/command-center/PRE_WIRING_READINESS_PLAN.md` status section

## Acceptance
- [ ] All wave reports present with commit SHAs
- [ ] development pushed
- [ ] Handoff doc complete

## Report
`dev-swarm/reports/legacy-ai-swarm/PWR-W7-integrator-proof.md`

## Commit (if doc-only)
`docs: pre-wiring readiness handoff`
