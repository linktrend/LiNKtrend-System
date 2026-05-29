# PWR-W2-B — Wizard wire-up to create API

## Objective
Add Project wizard calls POST /api/projects; validation feedback; success on detail page.

## Depends on
Wave 2 integrator merge of **PWR-W2-A** (API must exist on development)

## Branch
`dev/pwr-w2-b-wizard` from latest `development`

## Allowed files
- `LiNKaios/linkaios-web/src/components/projects/new-project-wizard.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/projects/new/page.tsx`
- `LiNKaios/linkaios-web/src/app/(shell)/projects/[id]/page.tsx` (created banner only)
- `LiNKaios/linkaios-web/src/components/project-created-banner.tsx` (new, optional)

## Steps
1. Replace `launchProject()` router slug hack with fetch POST /api/projects
2. Inline validation messages when Continue/Launch disabled
3. Cancel link on step 0 → `/projects`
4. On detail: read `?created=1` → dismissible success banner
5. Loading/error states on Launch (non-technical error copy)
6. typecheck

## Acceptance
- [ ] End-to-end: wizard → project detail, no 404
- [ ] Invalid deep-link suite handled
- [ ] created=1 shows feedback

## Report
`dev-swarm/reports/legacy-ai-swarm/PWR-W2-B-wizard-wireup.md`

## Commit
`feat(projects): wire add-project wizard to create API`
