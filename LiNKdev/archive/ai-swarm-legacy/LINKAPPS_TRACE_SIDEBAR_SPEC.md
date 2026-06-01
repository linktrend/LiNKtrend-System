# LiNKapps Trace Sidebar Integration Spec (WP-123)

## Overview

This document specifies the integration between the LiNKapps UI sidebar and LinkBrain cross-vertical trace data, enabling operators to view workflow trace summaries across LinkSites, LEXOS, and LiNKapps verticals.

## Goals

- Provide a sidebar component for browsing trace summaries
- Enable filtering by vertical, stage, outcome, and time
- Display privacy-safe trace aggregates (per WP-116)
- Support selection of traces for detailed viewing
- Integrate with existing LinkApps panel design (WP-110)

## Architecture

### Component Structure

```
components/linkapps/sidebar/
├── TraceSidebar.tsx         # Main sidebar container
├── TraceFilterPanel.tsx     # Filter controls
├── TraceSummaryList.tsx     # List of trace items
├── TraceMetricCard.tsx      # Metric display
└── index.ts                 # Exports

components/linkapps/panels/
└── TracePanel.tsx           # Main content panel

lib/plugins/linkapps/
├── types/trace.ts           # Type definitions
├── trace-fixtures.ts        # Mock data
└── trace-integration.ts     # Helper functions
```

### Data Flow

1. **TraceSidebar** manages filter state and selection
2. **TraceFilterPanel** emits filter changes
3. **TraceSummaryList** displays filtered items
4. **TracePanel** shows detailed view of selected trace

## Privacy Compliance (WP-116)

All trace data in this integration follows the privacy requirements defined in WP-116:

### Prohibited Fields (never present)

- Identity & tenancy: `tenant_id`, `org_id`, `workspace_id`, `account_id`, `customer_id`
- People: Names, emails, phone numbers, auth subject IDs
- Endpoints: IP addresses, full URLs with customer hosts
- CRM/ticketing: CRM record IDs, Plane project keys
- Content: Prompts, completions, documents, raw payloads

### Allowed Fields (what we display)

- Temporal: `bucket_start`, `bucket_end`, `hour`, `day`
- Coarse taxonomy: `vertical_key`, `stage_slug`, `outcome`
- Statistical: `count`, `avg_duration_ms`, `failure_rate`, `p95_latency_ms`
- Provenance: `schema_version`, `aggregation_job_id` (internal UUID)

## Type Definitions

See `apps/linkaios-web/src/lib/plugins/linkapps/types/trace.ts` for complete type definitions:

- `TraceSummary` — Privacy-safe trace aggregate record
- `TraceFilter` — Filter options for queries
- `TraceQueryRequest` / `TraceQueryResponse` — Query shapes
- `TraceMetric` — Metric card display data
- `TraceListItem` — Sidebar list item
- `TraceSidebarState` — Component state management

## Mock Data

The `trace-fixtures.ts` file provides privacy-compliant mock data:

- `MOCK_TRACE_SUMMARIES` — 8 sample traces across 5 verticals
- `MOCK_TRACE_QUERY_RESPONSE` — Complete query response
- `MOCK_TRACE_METRICS` — 4 dashboard metrics
- `MOCK_TRACE_LIST_ITEMS` — Pre-formatted list items

All mock data excludes prohibited fields and uses synthetic UUIDs.

## Integration Helpers

The `trace-integration.ts` file provides:

- `createTraceQueryRequest()` — Build query requests
- `traceMatchesFilter()` — Filter matching logic
- `filterTraces()` — Filter a list of traces
- `tracesToListItems()` — Convert for sidebar display
- `calculateTraceMetrics()` — Aggregate metrics
- `groupTracesByVertical/Stage/Outcome()` — Grouping utilities
- `validatePrivacyCompliance()` — Check for prohibited fields

## UI Components

### TraceSidebar

Main sidebar container with:
- Header with title and filter toggle
- Metrics row (4 compact metric cards)
- Collapsible filter panel
- Scrollable trace list
- Footer with count

### TraceFilterPanel

Filter controls for:
- Vertical (multi-select pills)
- Stage (multi-select pills)
- Outcome (multi-select pills with color coding)
- Time bucket (hour/day/week)

### TraceSummaryList

Displays trace items with:
- Outcome icon (success/failure/partial/in-progress/cancelled)
- Title (Vertical — Stage)
- Subtitle (time, count, outcome)
- Count badge
- Selection highlight

### TraceMetricCard

Displays a metric with:
- Label
- Current value
- Trend indicator (up/down/flat)
- Previous value comparison (optional)

### TracePanel

Main content panel showing:
- Selected trace header with outcome badge
- Metrics grid
- Aggregation details
- Time window info
- Performance statistics
- Active filters display
- Response metadata

## Usage Example

```tsx
import { TraceSidebar } from "@/components/linkapps/sidebar";
import { TracePanel } from "@/components/linkapps/panels/TracePanel";

function LinkappsTracePage() {
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TraceFilter>({});

  // Get selected trace from mock data
  const selectedTrace = MOCK_TRACE_SUMMARIES.find(
    (t) => t.aggregationJobId === selectedTraceId
  ) ?? null;

  return (
    <div className="flex h-full">
      <TraceSidebar
        onFilterChange={setFilter}
        onTraceSelect={setSelectedTraceId}
        selectedTraceId={selectedTraceId}
      />
      <main className="flex-1 overflow-auto p-6">
        <TracePanel selectedTrace={selectedTrace} filter={filter} />
      </main>
    </div>
  );
}
```

## Future Integration Points

When WP-116 database schema is ready:

1. Replace mock data with real trace aggregation queries
2. Add loading states for async data fetching
3. Implement real-time updates via subscription
4. Add pagination for large trace volumes
5. Implement export functionality

## Acceptance Criteria

- [x] Sidebar component structure exists with proper TypeScript typing
- [x] TracePanel displays trace summaries with filtering UI
- [x] Mock data fixtures follow WP-116 privacy-safe schema
- [x] Components follow LinkApps design patterns
- [x] Types are isolated in `types/trace.ts`
- [x] No live data fetching — only mocks/fixtures
- [x] Lint/typecheck passes for created files

## References

- WP-110: LiNKapps UI Panel Design
- WP-116: LinkBrain Cross-Vertical Trace Dashboard Schema
- WP-085: LiNKapps Vertical Plugin Conversion Plan
- `LINKBRAIN_BENCHMARKING_SPEC.md` §5: Privacy requirements
