# WP-123 - LiNKapps Sidebar and Trace Integration

## Objective

Integrate the existing LiNKapps factory dashboard into LiNKaios navigation and trace/status patterns so operators can reach and understand the App Factory flow.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-123-linkapps-sidebar-and-trace-integration`
- Base: `origin/development`

## Allowed files

- `apps/linkaios-web/src/app/**`
- `apps/linkaios-web/src/components/**`
- `apps/linkaios-web/src/lib/plugins/linkapps/**`
- `dev-swarm/command-center/LINKAPPS_SIDEBAR_TRACE_INTEGRATION.md`
- `dev-swarm/reports/legacy-ai-swarm/WP-123-linkapps-sidebar-and-trace-integration.md`

## Prohibited files

- No LiNKautowork workflow implementation.
- No provider provisioning calls.
- No changes to LEXOS or LinkSites paths.

## Required context

- `apps/linkaios-web/src/app/(shell)/linkapps/factory/page.tsx`
- `apps/linkaios-web/src/components/linkapps/**`
- `dev-swarm/command-center/LINKAPPS_LINKBRAIN_EVENT_SCHEMA.md`
- `dev-swarm/command-center/LINKAPPS_AUTOWORK_WORKFLOW_PACK.md`

## Steps

1. Inspect navigation/sidebar patterns and trace/status components.
2. Add a Linkapps nav entry or shell link using existing conventions.
3. Surface trace/event refs from mock fixtures where useful.
4. Add or refine fixtures/types only under Linkapps paths.
5. Run web typecheck after dependency builds.
6. Update the packet-specific report.

## Acceptance criteria

- LiNKapps factory dashboard is reachable from LiNKaios navigation or a clear landing route.
- Trace/status refs are represented in the dashboard without live provider calls.
- Web typecheck passes.

## Proof required

- Typecheck output.
- Route/navigation listing.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
