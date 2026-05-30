# PWR-W1-A — shadcn init + core primitives

## Objective
Initialize shadcn/ui in LiNKaios linkaios-web and add core primitives mapped to the existing zinc shell aesthetic.

## Repo / branch
- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/pwr-w1-a-shadcn` from latest `development`
- Worktree (if parallel): `.worktrees/pwr-w1-a-shadcn`

## Clean launch
```bash
git fetch origin development
git checkout development && git pull origin development
git status --short --branch  # must be clean before edits
```

## Allowed files
- `LiNKaios/linkaios-web/components.json` (new)
- `LiNKaios/linkaios-web/src/lib/utils.ts` (new)
- `LiNKaios/linkaios-web/src/app/globals.css`
- `LiNKaios/linkaios-web/src/components/ui/*` (shadcn primitives — NEW files only except status-pill coexistence)
- `LiNKaios/linkaios-web/package.json` (radix/cva deps only)
- `LiNKaios/linkaios-web/tsconfig.json` (paths if needed)

## Prohibited
- Do NOT delete or rewrite `status-pill.tsx` in this packet
- Do NOT mass-migrate existing pages to shadcn yet
- Do NOT touch `ui-standards.ts` except if required for cn() re-export note
- Do NOT commit secrets

## Required context
- `dev-swarm/product/grounding/PRE_WIRING_READINESS_PLAN.md`
- `.cursor/rules/07-ui-and-frontend-standards.mdc`
- Current `globals.css`, `ui-standards.ts` zinc palette

## Steps
1. Run shadcn init for Next.js 15 + Tailwind v4 in `LiNKaios/linkaios-web`
2. Map CSS variables in `globals.css` to match existing zinc light/dark shell
3. Add primitives: button, input, textarea, label, select, card, dialog, tabs, badge, separator, skeleton, dropdown-menu
4. Ensure `@/` alias works for `components/ui`
5. `npm run typecheck` && `npm run build`

## Acceptance criteria
- [ ] `components.json` exists
- [ ] At least 10 shadcn primitives under `src/components/ui/`
- [ ] Dark mode via `html.dark` still works
- [ ] typecheck + build pass
- [ ] Existing StatusPill still compiles

## Proof
- Command output: typecheck, build
- List primitives added

## Report
Update `dev-swarm/product/reports/archive/legacy-ai-swarm/PWR-W1-A-shadcn-init.md` with files, commands, commit SHA.

## Commit
`feat(ui): init shadcn primitives and theme variables`

Push branch; Integrator merges to `development`.
