# WP-123 Agent Prompt - LiNKapps Sidebar and Trace Integration

Use Kimi for this packet. This is UI component and type scaffold work; do not use Codex or Antigravity unless the orchestrator changes this assignment.

Execute `.ai-swarm/WORK_PACKETS/WP-123-linkapps-sidebar-and-trace-integration.md`.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-123 -b dev/kimi/WP-123-linkapps-sidebar-and-trace-integration origin/development
cd ../LiNKtrend-System-WP-123
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Dependency Gate

If WP-116 brain-traces.ts does not exist yet, create compatible type definitions based on WP-116's privacy requirements. Do not block on WP-116 completion.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/07-ui-and-frontend-standards.mdc`
- `plugins/vertical/linkapps/manifest.yaml`
- `.ai-swarm/WORK_PACKETS/WP-110-linkapps-ui-panel-design.md`
- `.ai-swarm/WORK_PACKETS/WP-116-linkbrain-cross-vertical-trace-dashboard-schema.md`
- `.ai-swarm/CONTRACTS_MVO.md`

## Mission

Create a LiNKapps sidebar component that integrates with LiNKbrain trace data, displaying workflow trace summaries with filtering capabilities. This bridges the UI panel design (WP-110) with the cross-vertical trace schema (WP-116).

## Scope

Allowed:

- Add `LiNKaios/linkaios-web/src/components/linkapps/sidebar/**` with sidebar components.
- Add `LiNKaios/linkaios-web/src/components/linkapps/panels/TracePanel.tsx`.
- Add `LiNKaios/linkaios-web/src/lib/plugins/linkapps/types/trace.ts` with type definitions.
- Add `LiNKaios/linkaios-web/src/lib/plugins/linkapps/trace-integration.ts` helpers.
- Add `.ai-swarm/LINKAPPS_TRACE_SIDEBAR_SPEC.md` documentation.
- Add mock data fixtures that comply with WP-116 privacy requirements.
- Add `.ai-swarm/AGENT_REPORTS/WP-123-linkapps-sidebar-and-trace-integration.md`.

Hard boundaries:

- No real trace data fetching or API calls.
- No changes to LiNKbrain SDK files (owned by WP-116).
- No database migrations.
- No PII or tenant-identifying fields in mock data.
- No live trace aggregation workers.

## Privacy Requirements for Mock Data

Per `LINKBRAIN_BENCHMARKING_SPEC.md` §5 and WP-116, the following fields MUST NOT appear in trace data:

- Identity & tenancy: `tenant_id`, `org_id`, `workspace_id`, `account_id`, `customer_id`
- People: Names, emails, phone numbers, auth subject IDs
- Endpoints: IP addresses, full URLs containing customer-owned hosts
- CRM/ticketing: CRM record IDs, Plane project keys revealing client names
- Content: Prompts, completions, documents, raw payloads

Allowed in trace data:

- Temporal: `bucket_start`, `bucket_end`, `hour`, `day`
- Coarse taxonomy: `vertical_key` (`linksites`, `lexos`, `linkapps`), `stage_slug`, `outcome`
- Statistical: `count`, `avg_duration_ms`, `failure_rate`, `p95_latency_ms`
- Provenance: `schema_version`, `aggregation_job_id` (internal UUID)

## Proof Required

- File listing of created components.
- Type definitions compile without errors.
- Mock data fixtures follow privacy requirements.
- Lint/typecheck output for touched files.
- Report includes branch, commit SHA, proof, and blockers.

## Finish

Commit message: `feat: add LinkApps sidebar with trace integration scaffold`
Push branch to GitHub.
