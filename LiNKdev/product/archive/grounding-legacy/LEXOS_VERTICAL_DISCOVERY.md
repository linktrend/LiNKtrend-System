# LEXOS Vertical Repo Discovery Report

**Work Packet:** WP-056
**Discovery Target:** `/Users/linktrend/Projects/LiNKtrend-LEXOS`
**Discovery Date:** 2026-05-15
**Agent:** Cursor/Kimi
**Repo Status:** Clean (no modifications made)

---

## Executive Summary

LEXOS (LiNKtrend Legal Operating System) is a litigation vertical application built as a Next.js web app with Supabase backend. It implements a sophisticated legal cognition workflow (W0–W11) for case management, evidence processing, assertion tracking, and legal document generation. The codebase is well-structured and represents significant investment in legal-domain vertical logic.

**Key Discovery:** LEXOS is a **complete vertical prototype** with established schemas, workflows, UI patterns, and domain models that can be adapted into a LiNKaios vertical plugin.

---

## 1. Repository Structure Overview

```
/Users/linktrend/Projects/LiNKtrend-LEXOS/
├── docs/                          # Comprehensive specification documents
│   ├── lexos-system-spec/         # 13 canonical system specification docs
│   └── implementation/            # MVP implementation roadmap + work packets
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── clients/               # Client management UI
│   │   ├── matters/[matterId]/    # Matter workspace with workflow stages
│   │   │   ├── adversarial/       # W10: Adversarial critique workspace
│   │   │   ├── argument/          # W9: Argument drafting
│   │   │   ├── assertions/        # W5: Assertion management
│   │   │   ├── evidence/          # W4: Evidence ingestion
│   │   │   ├── output/            # W11: Output artifacts
│   │   │   ├── research/          # W8: Legal research
│   │   │   ├── risks/             # Risk management
│   │   │   ├── story/             # W2: Case story management
│   │   │   ├── strategy/          # W6: Strategy memos
│   │   │   ├── support/           # W5: Support matrix
│   │   │   └── workflow/          # Workflow control
│   │   ├── dashboard/             # Operator dashboard
│   │   ├── intake/                # W0: Client intake workflow
│   │   ├── login/                 # Auth UI
│   │   └── page.tsx               # Landing page
│   ├── components/                # Shared UI components
│   │   ├── evidence/              # Evidence upload, cards, OCR status
│   │   ├── layout/                # App shell, breadcrumbs, nav
│   │   └── shell/                 # Page wrappers
│   ├── features/                  # Feature-specific components
│   │   ├── adversarial/           # W10 UI components
│   │   ├── argument/              # W9 UI components
│   │   ├── assertions/            # W5 assertion workspace
│   │   ├── evidence/              # W4 evidence workspace
│   │   ├── intake/                # W0 intake workspace
│   │   ├── output/                # W11 output workspace
│   │   ├── research/              # W8 research memo UI
│   │   ├── risks/                 # Risk panels
│   │   ├── story/                 # W2 case story UI
│   │   ├── strategy/              # W6 strategy memo UI
│   │   └── support/               # W5 support matrix UI
│   ├── lib/                       # Shared libraries
│   │   ├── extraction/            # Evidence extraction engine
│   │   ├── parser/                # Document parsing utilities
│   │   ├── storage/               # Evidence storage helpers
│   │   ├── story/                 # Case story utilities
│   │   └── supabase/              # Supabase clients
│   ├── server/                    # Server-side logic
│   │   ├── adversarial/           # W10 mutations, queries
│   │   ├── argument/              # W9 mutations, queries
│   │   ├── assertions/            # W5 mutations, queries
│   │   ├── audit/                 # Audit logging
│   │   ├── auth/                  # Auth context
│   │   ├── clients/               # Client mutations, queries
│   │   ├── evidence/              # W4 mutations, queries
│   │   ├── extraction/            # Extraction runner + QA
│   │   ├── intake/                # W0 mutations, queries
│   │   ├── matters/               # Matter mutations, queries
│   │   ├── output/                # W11 mutations, queries
│   │   ├── research/              # W8 mutations, queries
│   │   ├── story/                 # W2 mutations, queries
│   │   ├── strategy/              # W6 mutations, queries
│   │   ├── support/               # W5 mutations, queries
│   │   └── workflow/              # Workflow state machine
│   └── types/                     # TypeScript type definitions
│       ├── auth.ts                # Auth types
│       ├── database.ts            # Supabase-generated DB types (2,718 lines)
│       ├── domain.ts              # Domain types
│       └── intake.ts              # Intake workflow types
├── supabase/
│   ├── migrations/                # 22 migration files
│   └── seed/                      # Seed data
├── e2e/                           # Playwright E2E tests
├── .cursor/                       # Cursor skills + agent configs
└── package.json                   # Next.js 16 + Supabase + Tailwind v4
```

**Evidence:** `ls -la /Users/linktrend/Projects/LiNKtrend-LEXOS`

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.2.6 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| Database | Supabase (Postgres) | - |
| Auth | Supabase Auth | @supabase/ssr ^0.10.3 |
| Testing | Playwright | ^1.60.0 |
| Language | TypeScript | ^5 |

**Evidence:** `/Users/linktrend/Projects/LiNKtrend-LEXOS/package.json`

---

## 3. Database Schema (22 Migrations)

### Core Tables Identified

1. **Identity & Auth**
   - `user_profiles` — App-specific roles (admin, operator, reviewer, read_only, system_agent)

2. **W0 Intake Workflow**
   - `intake_records` — Intake workflow state
   - `intake_groups` — Related prospective clients
   - `client_candidates` — Prospective clients during intake

3. **W1 Client Memory**
   - `clients` — Persistent client records
   - `client_facts` — Client-level facts
   - `matters` — Matter records (client_id, current_workflow, posture)

4. **W4 Evidence**
   - `evidence` — Evidence objects
   - `evidence_extractions` — OCR/text extraction results
   - `evidence_originals` — Original file storage metadata

5. **W5 Assertions & Support**
   - `assertions` — Core epistemic units (truth states, support status)
   - `support_matrix_items` — Evidence-to-assertion support mapping

6. **W2 Case Story**
   - `case_stories` — Matter narrative
   - `assertion_extractions` — Assertions extracted from stories

7. **W6 Strategy**
   - `strategy_memos` — Strategy documents

8. **W8 Research**
   - `research_memos` — Legal research outputs

9. **W9 Argument**
   - `argument_drafts` — Legal argument drafts

10. **W10 Adversarial**
    - `adversarial_critiques` — Attack matrix, severity analysis

11. **W11 Output**
    - `output_artifacts` — Final deliverables

12. **Cross-Cutting**
    - `workflow_states` — Workflow state machine
    - `risks` — Risk registry
    - `audit_events` — Audit trail
    - `tool_model_logs` — LLM call logging

**Evidence:**
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/supabase/migrations/`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/types/database.ts` (2,718 lines)

---

## 4. Workflow Specification (W0–W11)

| Workflow | Purpose | Key Objects |
|----------|---------|-------------|
| W0 | Client Onboarding | intake_records, client_candidates |
| W1 | Client Master Record | clients, client_facts |
| W2 | Case-Client Story | case_stories, assertions |
| W3 | Opposing File Intake | (defense-side reconciliation) |
| W4 | Evidence Ingestion | evidence, evidence_extractions |
| W5 | Support Mapping | support_matrix_items |
| W6 | Strategy | strategy_memos |
| W7 | Risk Register | risks |
| W8 | Legal Research | research_memos |
| W9 | Argument Drafting | argument_drafts |
| W10 | Adversarial Review | adversarial_critiques |
| W11 | Output Generation | output_artifacts |

**Evidence:** `/Users/linktrend/Projects/LiNKtrend-LEXOS/docs/lexos-system-spec/05 LEXOS Workflow Specification.md`

---

## 5. UI/UX Structure

### Page Routes (App Router)

- `/` — Landing page
- `/login` — Auth
- `/dashboard` — Operator dashboard with intake list, matter list
- `/clients` — Client list
- `/clients/new` — Create client
- `/clients/[clientId]` — Client detail
- `/clients/[clientId]/matters/new` — Create matter for client
- `/intake` — Intake records list
- `/intake/new` — New intake
- `/intake/[intakeId]` — Intake detail workspace
- `/matters/[matterId]/overview` — Matter dashboard
- `/matters/[matterId]/story` — W2 Case story workspace
- `/matters/[matterId]/evidence` — W4 Evidence workspace
- `/matters/[matterId]/assertions` — W5 Assertions workspace
- `/matters/[matterId]/support` — W5 Support matrix
- `/matters/[matterId]/strategy` — W6 Strategy memo workspace
- `/matters/[matterId]/research` — W8 Research memo workspace
- `/matters/[matterId]/argument` — W9 Argument draft workspace
- `/matters/[matterId]/adversarial` — W10 Adversarial critique workspace
- `/matters/[matterId]/output` — W11 Output artifacts
- `/matters/[matterId]/risks` — Risk registry

**Evidence:** `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/app/` directory structure

---

## 6. Reusable Code Assets

### A. Type Definitions (Highly Reusable)

**File:** `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/types/database.ts`
- 2,718 lines of auto-generated Supabase types
- Complete type safety for all 20+ tables
- Row/Insert/Update/Relationships for each table

**File:** `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/types/intake.ts`
- Intake workflow status enums
- Type guards (isIntakeFrozen)
- Reusable for any workflow state machine

**File:** `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/types/domain.ts`
- Domain-specific types

### B. Server Mutations & Queries (Pattern-Reusable)

**Location:** `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/server/`

Each workflow stage has consistent structure:
- `mutations.ts` — Create, update, delete operations
- `queries.ts` — Read operations with filtering
- `summary.ts` — Aggregation queries (where applicable)

**Example Patterns:**
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/server/workflow/mutations.ts` — Workflow state machine transitions
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/server/intake/mutations.ts` — 21KB of intake workflow logic
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/server/support/mutations.ts` — Support matrix CRUD with validation

### C. UI Components (Adaptable)

**Layout Components:**
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/components/layout/AppShell.tsx`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/components/layout/Breadcrumbs.tsx`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/components/layout/MatterSubnav.tsx`

**Feature Workspaces (180 total TS/TSX files):**
- Evidence workspace with upload, OCR status, QA
- Support matrix with drag-drop support levels
- Strategy memo with issue panels
- Argument drafting with revision history
- Adversarial critique with attack matrix

### D. Database Migrations (Reusable Schema)

**22 Migration Files:**
- Complete litigation schema
- RLS policies per-work-package
- Index definitions
- Trigger functions

**Key Files:**
- `20260511000001_extensions_and_enums.sql` — Foundation enums
- `20260511000002_identity_intake_clients_matters.sql` — Core identity
- `20260511000003_evidence_and_extractions.sql` — Evidence model
- `20260511000004_assertions_support_risks.sql` — Assertions + support
- `20260511000005_artifacts_workflows_audit.sql` — Artifacts + audit

---

## 7. Domain Model for Vertical Plugin Conversion

### Vertical Plugin: LEXOS Litigation

**Purpose:** Legal case management with evidence-based assertion tracking

**Work Request Types:**
1. `intake:new` — New client intake
2. `matter:create` — Create matter for client
3. `evidence:ingest` — Upload and process evidence
4. `assertion:extract` — Extract assertions from evidence
5. `support:map` — Map evidence support to assertions
6. `strategy:develop` — Create strategy memo
7. `research:conduct` — Legal research
8. `argument:draft` — Draft legal argument
9. `adversarial:review` — Adversarial critique
10. `output:generate` — Generate deliverable

**Workflow Stages:** W0 → W1 → W2 → (W3 if defense) → W4 → W5 → W6 → W7 → W8 → W9 → W10 → W11

**Required LiNKbot Roles:**
- `lexos-intake-agent` — W0 intake processing
- `lexos-extraction-agent` — W4 evidence extraction
- `lexos-assertion-agent` — W5 assertion extraction
- `lexos-strategy-agent` — W6 strategy development
- `lexos-research-agent` — W8 legal research
- `lexos-argument-agent` — W9 argument drafting
- `lexos-adversarial-agent` — W10 adversarial review

**Required Capability Plugins:**
- `storage:supabase` — File storage for evidence
- `extraction:ocr` — OCR/text extraction
- `extraction:qa` — QA comparison of extractions
- `llm:generation` — LLM for drafting
- `research:legal` — Legal research APIs

**LiNKaios UI Panels:**
- Intake dashboard
- Matter workspace
- Evidence browser
- Assertion workspace
- Support matrix
- Strategy editor
- Research panel
- Argument editor
- Output preview

---

## 8. Capability Dependencies Identified

### From LEXOS Codebase:

1. **Evidence Storage** — Supabase Storage with RLS
2. **OCR Extraction** — Document text extraction (local pattern in `src/lib/extraction/`)
3. **QA Comparator** — Extraction quality comparison (`src/lib/extraction/qa/comparator.ts`)
4. **Layout Parser** — Document structure parsing (`src/lib/parser/layout-parser.ts`)

### Required for Full LEXOS Vertical:

1. **Supabase Storage Capability** — For evidence files
2. **Document AI/OCR Capability** — For extraction (could use Mistral AI, Google Document AI, or local)
3. **LLM Capability** — For drafting, research, critique
4. **Search/Retrieval Capability** — For legal research integration

---

## 9. What Must Be Copied/Adapted vs Deferred

### Copy/Adapt for MVO Integration:

| Asset | Location | Effort | Priority |
|-------|----------|--------|----------|
| Database schema | `supabase/migrations/` | Medium | High |
| Database types | `src/types/database.ts` | Low | High |
| Intake types | `src/types/intake.ts` | Low | High |
| Server mutations pattern | `src/server/*/mutations.ts` | Medium | Medium |
| Server queries pattern | `src/server/*/queries.ts` | Low | Medium |
| Workflow state machine | `src/server/workflow/mutations.ts` | Medium | High |
| UI workspace patterns | `src/features/*/` | High | Low |
| Layout components | `src/components/layout/` | Low | Medium |
| Evidence upload UI | `src/components/evidence/` | Medium | Medium |

### Deferred (Not for MVO):

- Full 11-workflow implementation (MVO may scope to W0–W4)
- Advanced adversarial critique automation
- Complex output artifact generation
- Full risk management automation
- Multi-jurisdiction support

---

## 10. Hard Unknowns for Integrator

1. **Legal Workflow Authority** — Who defines the specific litigation workflows? The spec docs exist but need product owner validation.

2. **Evidence Processing Scale** — OCR/extraction currently local pattern; production scale needs defined.

3. **LLM Provider Strategy** — Current logging in `tool_model_logs` but no provider abstraction.

4. **Multi-Tenancy** — Current schema has `client_id`/`matter_id` but no explicit tenant isolation for LiNKaios multi-tenant mode.

5. **Integration with External Legal Research** — Westlaw, LexisNexis, etc. not yet defined.

6. **Privilege/Confidentiality Enforcement** — Schema has fields (`privilege_status`, `confidentiality_status`) but enforcement rules need definition.

---

## 11. Evidence Summary

### Commands Run:

```bash
# Repo structure exploration
ls -la /Users/linktrend/Projects/LiNKtrend-LEXOS
ls -laR /Users/linktrend/Projects/LiNKtrend-LEXOS/src
ls -la /Users/linktrend/Projects/LiNKtrend-LEXOS/supabase/migrations

# Document discovery
find /Users/linktrend/Projects/LiNKtrend-LEXOS -type f -name "*.md" | head -50

# TypeScript file count
find /Users/linktrend/Projects/LiNKtrend-LEXOS/src -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l

# Target repo clean status verification
git -C /Users/linktrend/Projects/LiNKtrend-LEXOS status --short
```

### Key Evidence Paths:

1. **Specification Documents:** `docs/lexos-system-spec/01-13 LEXOS *.md`
2. **Implementation Roadmap:** `docs/implementation/00 MVP Implementation Roadmap.md`
3. **Database Schema:** `supabase/migrations/20260511*.sql` (22 files)
4. **Type Definitions:** `src/types/database.ts` (2,718 lines)
5. **Workflow Logic:** `src/server/workflow/mutations.ts`
6. **UI Structure:** `src/app/matters/[matterId]/*/page.tsx`
7. **Server Logic:** `src/server/*/{mutations,queries}.ts`

### Target Repo Status:

**Result:** Clean — no modifications made to `/Users/linktrend/Projects/LiNKtrend-LEXOS`

---

## 12. Recommendations for Integrator

1. **Schema Reuse** — The LEXOS migrations can be adapted as the foundation for the LEXOS vertical plugin schema. The 22 migration files represent substantial legal-domain data modeling.

2. **Type Generation** — The `database.ts` types can be regenerated for the LiNKaios plugin using the same Supabase type generation pattern.

3. **Workflow State Machine** — The workflow mutations pattern in `src/server/workflow/mutations.ts` shows how to implement W0–W11 progression; adapt this for LiNKaios work request state management.

4. **UI Patterns** — The feature workspace pattern (e.g., `src/features/assertions/assertion-workspace.tsx`) shows how to organize complex vertical UI; adapt for LiNKaios plugin panels.

5. **Deferred Capabilities** — The OCR/extraction logic is currently a local pattern; consider whether this becomes a capability plugin or remains vertical-internal.

---

## 13. File Count Summary

| Category | Count |
|----------|-------|
| TypeScript/TSX files | 180 |
| Database migrations | 22 |
| Specification documents | 13 + 6 implementation |
| UI feature workspaces | 12 |
| Server modules | 17 |

---

*Discovery complete. Target repo clean. Ready for Integrator review and work packet generation.*
