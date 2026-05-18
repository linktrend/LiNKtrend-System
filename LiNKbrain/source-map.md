# LiNKbrain Source Map

This file maps current compatibility code to the canonical LiNKbrain ownership home.

## Current Compatibility Locations

### SDK Layer (packages/linklogic-sdk/src/)

| File | Purpose | WP Reference |
|------|---------|------------|
| `brain-audit.ts` | Audit envelope writer per §6.3 CONTRACTS_MVO | WP-006, WP-086 |
| `brain-memory.ts` | Memory object schemas and persistence (LeadMemory, ResearchBundle, EpisodeSummary) | WP-087 |
| `brain-trace-intelligence.ts` | **NEW (WP-202)** Operator-facing trace views, run/memory/audit lineage | WP-202 |
| `context-assembly.ts` | Context bundle schema and assembly helpers for LiNKbot | WP-088 |
| `brain-retrieval.ts` | Retrieval and progressive disclosure for virtual files | Legacy |
| `brain-virtual-files.ts` | Virtual file system for knowledge management | Legacy |
| `brain-embeddings.ts` | Embedding generation (Gemini) | Legacy |
| `brain-benchmarks.ts` | Benchmark and feedback record schemas | WP-089 |

### UI Layer (LiNKaios/linkaios-web/src/)

| File | Purpose | Notes |
|------|---------|-------|
| `components/linkbrain/memory-command-centre.tsx` | Main LiNKbrain workspace UI | Owned by LiNKaios, uses LiNKbrain data |
| `components/linkbrain/linkbrain-filters.tsx` | Filter components for memory views | Owned by LiNKaios |
| `components/linkbrain/linkbrain-tab-nav.tsx` | Tab navigation | Owned by LiNKaios |
| `lib/linkbrain-data.ts` | Data loading for memory/inbox views | Owned by LiNKaios, calls SDK |
| `lib/linkbrain-trace-data.ts` | **NEW (WP-202)** Data loading for trace intelligence views | Owned by LiNKaios, calls SDK |

### Database Layer (services/migrations/)

- `services/migrations/*linkbrain*` and related `brain_*` migrations: Postgres/Supabase persistence.
- Schema: `linkbrain` with tables for `audit_events`, `memory_objects`, `context_assemblies`.

## WP-202 Additions (Operator Intelligence)

New files added for operator-facing trace intelligence:

1. **`packages/linklogic-sdk/src/brain-trace-intelligence.ts`** — Core SDK surface for:
   - `getRunTrace()` — Full run trace with stages, audit events, memory objects
   - `getLeadTrace()` — Cross-run trace for a lead
   - `getOperatorBrainStatus()` — Health and activity metrics
   - `getRecentActivitySummary()` — Recent audit events for dashboards
   - `isMvoCompleteTrace()` — Check if trace meets MVO requirements per §8 CONTRACTS_MVO

2. **`packages/linklogic-sdk/src/brain-trace-intelligence.test.ts`** — Unit tests for trace intelligence

3. **`LiNKaios/linkaios-web/src/lib/linkbrain-trace-data.ts`** — UI data helpers:
   - `loadRunTraceForOperator()` — Server action wrapper for run traces
   - `loadLeadTraceForOperator()` — Server action wrapper for lead traces
   - `loadBrainStatusForOperator()` — Status view data
   - `loadRecentActivityForOperator()` — Recent activity feed

## Migration Rule

Move implementation here only when package boundaries, imports, and deployment checks remain green. Until then, this folder is the source-of-truth ownership home and the map above tells agents where active compatibility code lives.
