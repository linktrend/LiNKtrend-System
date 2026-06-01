# WP-229 — LinkBots Project Work Context UI

## Objective

Enhance the existing LinkBots UI, especially each LinkBot page's Projects tab, to show what each LinkBot is working on by Module, Project Type, Project, Workflow, Issue, and Run/status.

Do not redesign LinkBots from scratch. Extend the current UI direction.

## Repo / Worktree

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Worktree: `.worktrees/WP-229-linkbots-project-work-context-ui`
- Branch: `wp-229-linkbots-project-work-context-ui`

## Dependencies

- Depends on WP-226 commit.

## Allowed Files

- `LiNKaios/linkaios-web/src/app/(shell)/workers/**`
- `LiNKaios/linkaios-web/src/components/worker*.tsx`
- `LiNKaios/linkaios-web/src/components/workers*.tsx`
- `LiNKaios/linkaios-web/src/lib/ui-mocks/**`
- `LiNKaios/linkaios-web/src/lib/worker*.ts`
- `.ai-swarm/AGENT_REPORTS/WP-229-linkbots-project-work-context-ui.md`
- `.ai-swarm/AGENT_REPORTS/LINKAIOS_UIUX_REVIEW_BACKLOG.md`

## Prohibited Files

- Database migrations.
- Bot runtime behavior under `LiNKbot/`.
- Projects pages owned by WP-228 except links.
- LinkBrain/LinkSkills pages.

## Required Context

- WP-226 report and commit.
- Existing LinkBots/Workers pages.
- `.ai-swarm/AGENT_REPORTS/CURRENT_STATE_VERIFICATION_WARNING.md`

## Required UI/UX Skills

Use `frontend-design`, `web-design-guidelines`, `webapp-testing`, `nextjs-react-expert`, `tailwind-patterns`, `testing-patterns`, `control-ui`, and `deslop`.

## Steps

1. Verify clean packet worktree before editing.
2. Keep current LinkBots UI structure.
3. On each LinkBot page under the Projects tab, show each project with Module, Project Type, Workflow, Issue, status, and recent Run/Trace link where available/mockable.
4. Show whether the bot is assigned, working, completed, blocked, failed, or paused using shared status/color language.
5. Add filters/grouping if low-risk: by Module, Project, or status.
6. Use mock/demo data if live data is not yet wired; clearly label sample/synthetic data.
7. Add backlog entries for backend wiring if needed.

## Acceptance Criteria

- LinkBot project tab answers: "What is this LinkBot doing, for which module/project/workflow/issue?"
- UI does not imply unproven live runtime completion.
- Existing LinkBots navigation remains intact.

## Proof Required

- `pnpm --filter @linktrend/linkaios-web typecheck`
- Focused tests if helpers/components are added.
- Browser screenshots for LinkBots list and a LinkBot Projects tab.
- Report file: `.ai-swarm/AGENT_REPORTS/WP-229-linkbots-project-work-context-ui.md`

## Completion Handoff

Commit all intended changes on the packet branch and record final commit SHA, files changed, commands run, screenshots/proof, blockers, and next step in the report.
