# WP-123 - LiNKapps Sidebar and Trace Integration

## Objective

Create an integrated sidebar component for LiNKapps that displays workflow trace information from LiNKbrain, enabling operators to view cross-vertical trace summaries alongside the app factory panels.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/kimi/WP-123-linkapps-sidebar-and-trace-integration`
- Base: `origin/development`

## Allowed Files

- `LiNKaios/linkaios-web/src/components/linkapps/sidebar/**`
- `LiNKaios/linkaios-web/src/components/linkapps/panels/TracePanel.tsx`
- `LiNKaios/linkaios-web/src/lib/plugins/linkapps/trace-integration.ts`
- `LiNKaios/linkaios-web/src/lib/plugins/linkapps/types/trace.ts`
- `.ai-swarm/LINKAPPS_TRACE_SIDEBAR_SPEC.md`
- `.ai-swarm/AGENT_REPORTS/WP-123-linkapps-sidebar-and-trace-integration.md`

## Prohibited Files

- No changes to LiNKbrain SDK schemas (WP-116 owns those)
- No changes to LinkSites UI
- No database migrations
- No live trace aggregation workers
- No real trace data fetching (use fixtures/mocks)

## Required Context

- `.ai-swarm/WORK_PACKETS/WP-110-linkapps-ui-panel-design.md`
- `.ai-swarm/WORK_PACKETS/WP-116-linkbrain-cross-vertical-trace-dashboard-schema.md`
- `plugins/vertical/linkapps/manifest.yaml`
- `packages/linklogic-sdk/src/brain-traces.ts` (if WP-116 has created it)
- `.cursor/rules/07-ui-and-frontend-standards.mdc`

## Steps

1. Inspect current LiNKaios component structure and LinkApps manifest.
2. Create type definitions for trace sidebar data (trace summaries, filters, aggregates).
3. Create the sidebar component structure:
   - `TraceSidebar` — Main sidebar container
   - `TraceFilterPanel` — Filter controls (vertical, stage, time range)
   - `TraceSummaryList` — List of trace summaries
   - `TraceMetricCard` — Individual metric display
4. Create the TracePanel component for the main content area.
5. Define mock data fixtures for trace summaries matching WP-116 schema.
6. Create integration types and helpers in `lib/plugins/linkapps/`.
7. Document the sidebar/trace integration spec.
8. Update the packet-specific report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance Criteria

- [ ] Sidebar component structure exists with proper TypeScript typing
- [ ] TracePanel displays trace summaries with filtering UI
- [ ] Mock data fixtures match WP-116 privacy-safe schema (no PII, tenant IDs)
- [ ] Components follow LinkApps design patterns from manifest
- [ ] Types are isolated in `types/trace.ts`
- [ ] No live data fetching — only mocks/fixtures
- [ ] Lint/typecheck passes for created files

## Proof Required

- File listing of created sidebar components.
- Component source showing TypeScript types and mock data.
- Lint/typecheck output for touched files.
- Branch and commit SHA.
