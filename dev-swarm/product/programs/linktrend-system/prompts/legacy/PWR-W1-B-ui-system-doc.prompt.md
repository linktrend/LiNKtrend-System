# PWR-W1-B — UI system index doc + rules update

## Objective
Single human/agent entry point for the LiNKaios UI system; update Cursor rules to reference shadcn + existing composites.

## Repo / branch
- Branch: `dev/pwr-w1-b-ui-doc` from latest `development`

## Allowed files
- `LiNKaios/linkaios-web/docs/ui-system.md` (new)
- `.cursor/rules/07-ui-and-frontend-standards.mdc`
- `.cursor/skills/SKILLS_CATALOG.md` (add ui-system routing entry only)

## Prohibited
- Do NOT edit `globals.css`, `components/ui/*`, or application pages
- Do NOT run shadcn init in this packet

## Steps
1. Write `docs/ui-system.md` index:
   - Color source: `globals.css` CSS variables
   - Primitives: `components/ui/` (shadcn)
   - Behavior tokens: `lib/ui-standards.ts`, `lib/ui-theme.ts`, `lib/status-colors.ts`
   - Composites: data-table, action-queue, summary-metric-card, forms
   - Icons: lucide-react only
   - Shell: ShellMainFrame, ShellPageHeader, AutoBreadcrumbs
   - Migration map: BUTTON.* → shadcn Button variants (table)
2. Update rule 07 to say: new UI uses shadcn primitives + ui-standards composites
3. Add SKILLS_CATALOG pointer

## Acceptance
- [ ] ui-system.md is complete and accurate
- [ ] Rules reference ui-system.md

## Report
`dev-swarm/product/reports/archive/legacy-ai-swarm/PWR-W1-B-ui-system-doc.md`

## Commit
`docs(ui): add ui-system index and update frontend standards`
