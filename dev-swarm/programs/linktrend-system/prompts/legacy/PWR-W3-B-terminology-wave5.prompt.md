# PWR-W3-B — Terminology Wave 5 stragglers

## Objective
Final user-facing terminology pass per `.cursor/rules/12-suite-project-terminology.mdc`.

## Branch
`dev/pwr-w3-b-terminology` from `development` after Wave 2

## Allowed files
- `LiNKaios/linkaios-web/src/**` (copy only — no backend Mission rename)
- `.cursor/rules/12-suite-project-terminology.mdc` (examples only if needed)

## Search & fix
- User-facing "Mission" → Project (except code identifiers)
- "Connector" → Capability where product-facing
- "n8n" / "workflow" in UI → Automation
- Wrong "Module" when Suite meant
- `/modules` links → `/suites/*` if any remain
- Help copy, breadcrumbs, fixtures, empty states

## Prohibited
- DB/API mission→project rename (Wave 6)
- Route renames already done in Wave 0

## Acceptance
- [ ] Grep audit: no user-visible Mission in shell UI
- [ ] typecheck passes

## Proof
- `rg -i "mission" LiNKaios/linkaios-web/src/app LiNKaios/linkaios-web/src/components` (document exceptions)

## Report
`dev-swarm/reports/legacy-ai-swarm/PWR-W3-B-terminology-wave5.md`

## Commit
`chore(ui): terminology wave 5 stragglers`
