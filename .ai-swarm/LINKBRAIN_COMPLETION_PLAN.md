# LiNKbrain Completion Plan

LiNKbrain is the institutional memory and learning plane. This plan defines the remaining work to move from the LinkSites MVO v2 stubs to a "finished enough" production-ready memory plane.

## 1. Definition of "Finished Enough"

LiNKbrain is considered finished enough for the platform when:
- **Audit Ledger:** 100% of side effects, reasoning cycles, and governance decisions across all planes are recorded in the canonical audit envelope.
- **Memory Objects:** Typed, scoped, and versioned memory objects (Leads, Research, Episodes, Incidents) are derived from the event ledger and persisted.
- **Context Assembly:** LiNKbot can request and receive a scoped, provenance-backed context bundle for any task.
- **Retrieval:** Multi-modal retrieval (metadata, keyword, vector) is functional and respects the scope lattice.
- **Learning Loop:** A feedback mechanism exists to improve future runs based on past outcomes and benchmarks.

## 2. Gap Map & Completion Strategy

### 2.1 Audit Ledger (Event Plane)
- **Status:** Envelope schema and SDK writer exist.
- **Gaps:** LiNKbot role lifecycle, readiness checks, research provenance, and governance authorization details.
- **Strategy:** Update `AUDIT_ACTIONS` and implement emitters in LiNKbot and LiNKautowork.

### 2.2 Memory Objects (Intelligence Plane)
- **Status:** Stubbed persistence in kernel.
- **Gaps:** No schema for derived objects; no extraction logic.
- **Strategy:** Define Postgres schemas for `LeadMemory`, `ResearchBundle`, and `EpisodeSummary`. Implement background workers to promote events to memory objects.

### 2.3 Context Assembly & Retrieval (Retrieval Plane)
- **Status:** Basic retrieval in SDK; no assembly logic.
- **Gaps:** No `ContextAssembler` service; no scope-lattice enforcement; no pgvector integration for semantic search.
- **Strategy:** Build the `ContextAssembler` service. Implement `pgvector` embeddings for research bundles. Enforce `(tenant_id, plugin_id, role_id)` scope filters.

### 2.4 Benchmark & Learning (Learning Plane)
- **Status:** Not implemented.
- **Gaps:** No cross-tenant benchmark surface; no outcome feedback loop.
- **Strategy:** Create a `benchmarks` table for anonymized metrics. Implement a "Feedback" capability for LiNKbot/Operators.

## 3. Implementation Roadmap (Follow-up Packets)

| Packet | Title | Objective | Dependencies |
|---|---|---|---|
| **WP-086** | Audit Ledger Completion | Capture LiNKbot roles, readiness checks, and provenance. | WP-065 |
| **WP-087** | Memory Object Schemas | Define and implement Lead, Research, and Episode persistence. | WP-086 |
| **WP-088** | Context Assembler | Build the scoped retrieval and assembly service with pgvector. | WP-087 |
| **WP-089** | Learning & Benchmarks | Implement feedback loop and cross-tenant benchmark telemetry. | WP-088 |

## 4. Open Decisions

- **D-LB-01:** Should memory extraction be real-time or batch? (Recommendation: Real-time for episodes, batch for cross-tenant benchmarks).
- **D-LB-02:** Embedding model for pgvector? (Recommendation: `text-embedding-3-small` or equivalent).
- **D-LB-03:** Retention policy for raw events? (Recommendation: 90 days hot, indefinite cold storage).
