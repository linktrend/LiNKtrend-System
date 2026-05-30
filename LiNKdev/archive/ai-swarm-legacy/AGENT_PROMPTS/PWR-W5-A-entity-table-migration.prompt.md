# PWR-W5-A — EntityTable → DataTable migration (high-traffic)

## Objective
Migrate remaining high-traffic EntityTable usages to data-table family per skill.

## Branch
`dev/pwr-w5-a-datatable` from `development` after Wave 4

## Read first
- `.cursor/skills/data-table/SKILL.md`

## Allowed files (pick 3–5 tables max this wave)
- `LiNKaios/linkaios-web/src/components/entity-table.tsx` (deprecation note only)
- Target tables TBD by agent from grep — prioritize: workers list, skills/tools catalog, settings access roles

## Prohibited
- Breaking row actions
- Removing sort/filter where present

## Acceptance
- [ ] At least 3 tables migrated
- [ ] Visual parity with DT tokens
- [ ] typecheck

## Report
`.ai-swarm/AGENT_REPORTS/PWR-W5-A-entity-table-migration.md`

## Commit
`refactor(ui): migrate high-traffic tables to DataTable`
