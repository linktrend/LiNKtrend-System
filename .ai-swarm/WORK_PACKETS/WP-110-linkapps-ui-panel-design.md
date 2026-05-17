# WP-110 - LiNKapps UI Panel Design

## Objective

Create a LiNKapps app-factory UI panel design and lightweight component scaffold for LiNKaios, focused on squad status, blueprint intake, and deterministic run visibility.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-110-linkapps-ui-panel-design`
- Base: `origin/development`

## Allowed files

- `apps/linkaios-web/src/components/linkapps/**`
- `apps/linkaios-web/src/lib/plugins/linkapps/**`
- `apps/linkaios-web/src/app/**/linkapps/**`
- `.ai-swarm/LINKAPPS_UI_PANEL_DESIGN.md`
- `.ai-swarm/AGENT_REPORTS/WP-110-linkapps-ui-panel-design.md`

## Prohibited files

- No backend workflow implementation
- No real provisioning calls
- No changes to LinkSites UI
- No Antigravity/browser-only workflow requirement

## Required context

- `plugins/vertical/linkapps/manifest.yaml`
- `.ai-swarm/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`
- `.ai-swarm/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `.cursor/rules/07-ui-and-frontend-standards.mdc`

## Steps

1. Inspect current LiNKaios app/component structure and pick the closest local UI pattern.
2. Add a small design/spec doc covering panel states, information architecture, and run/trace visibility.
3. Add lightweight static/mock components only if the app structure makes that safe without routing churn.
4. Keep data mocked or typed fixtures; do not call provisioning providers.
5. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- UI design covers blueprint intake, squad monitor, capability leases, workflow status, and handoff pack output.
- Any component scaffold is isolated under Linkapps-specific paths.
- No external side effects or production provider calls.
- Tests/typecheck/lints are run where practical for touched files.

## Proof required

- Component/file listing or design doc citation.
- Lint/typecheck output for touched frontend files, or precise blocker if baseline prevents it.
- Screenshot only if a local app route is already available without extra integration work.
