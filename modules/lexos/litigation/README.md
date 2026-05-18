# LEXOS Litigation Module

LEXOS Litigation is the first active LEXOS practice module, providing legal case management with evidence-based assertion tracking for litigation matters.

## Overview

This module implements the W0-W11 legal cognition workflow:

| Stage | Name | Description | Primary Role |
|-------|------|-------------|--------------|
| W0 | Client Onboarding | New client/matter intake, conflict check | Intake Agent |
| W1 | Client Master Record | Maintain client master record | Custodian Agent |
| W2 | Case-Client Story | Create case master story from narrative | Story Architect |
| W3 | Opposing File Reconciliation | Defense-side reconciliation (optional) | - |
| W4 | Evidence Intake | Ingest and process evidence | Evidence Archivist |
| W5 | Support Matrix | Map assertions to evidence | Analyst |
| W6 | Strategy | Develop case strategy | Strategist |
| W7 | Legal Research | Conduct legal research | Librarian |
| W8 | Argument Drafting | Draft legal arguments | Advocate |
| W9 | Adversarial Review | Stress-test arguments | Adversary |
| W10 | Visual Exhibits | Generate visual artifacts | - |
| W11 | Output Refinement | Final output preparation | Rhetorician |

## Module Structure

```
modules/lexos/litigation/
├── README.md           # This file
├── manifest.ts         # Module manifest and constants
├── index.ts            # Public API exports
├── manifest/           # Detailed manifest files
├── ui/                 # UI component declarations
├── routes/             # Route definitions
└── events/             # Event type declarations
```

## Work Request Types

- `lexos.intake.new` — New client/matter intake
- `lexos.matter.create` — Create matter for existing client
- `lexos.story.develop` — Develop case story
- `lexos.evidence.ingest` — Ingest and process evidence
- `lexos.assertions.extract` — Extract assertions from story/evidence
- `lexos.support.map` — Map evidence support to assertions
- `lexos.strategy.develop` — Develop case strategy
- `lexos.research.conduct` — Conduct legal research
- `lexos.argument.draft` — Draft legal argument
- `lexos.adversarial.review` — Perform adversarial critique
- `lexos.output.generate` — Generate final output artifact

## Required Roles

See `LiNKbot/roles/modules/lexos/` for role definitions:

- `lexos_intake_agent`
- `lexos_custodian_agent`
- `lexos_story_architect`
- `lexos_evidence_archivist`
- `lexos_analyst`
- `lexos_strategist`
- `lexos_librarian`
- `lexos_advocate`
- `lexos_adversary`
- `lexos_rhetorician`

## Required Capability Connectors

- `cap.storage.supabase` — Data storage
- `cap.storage.evidence` — Evidence file storage
- `cap.extraction.parser` — Document parsing
- `cap.extraction.ocr` — OCR text extraction
- `cap.extraction.qa` — Extraction quality assurance
- `cap.research.legal` — Legal research (shadow mode for MVO)
- `cap.research.public_web` — Public web research
- `cap.llm.generation` — LLM text generation
- `cap.crm.mock` — Mock CRM (MVO only)
- `cap.plane.mock` — Mock Plane (MVO only)

## Required Workflow Hooks

See `LiNKautowork/templates/` for workflow definitions:

- `autowork.lexos.evidence_ingest`
- `autowork.lexos.extraction_run`
- `autowork.lexos.assertion_sync`
- `autowork.lexos.artifact_generate`
- `autowork.lexos.crm_sync`

## UI Panels

### Matter Workspaces

- `/matters/[matterId]/overview` — Matter dashboard
- `/matters/[matterId]/story` — Case story editing
- `/matters/[matterId]/evidence` — Evidence workspace
- `/matters/[matterId]/assertions` — Assertions management
- `/matters/[matterId]/support` — Support matrix
- `/matters/[matterId]/strategy` — Strategy memo
- `/matters/[matterId]/research` — Research memo
- `/matters/[matterId]/argument` — Argument draft
- `/matters/[matterId]/adversarial` — Adversarial critique
- `/matters/[matterId]/output` — Output artifacts
- `/matters/[matterId]/risks` — Risk registry

### Intake & Clients

- `/intake` — Intake records list
- `/intake/[intakeId]` — Intake workspace
- `/clients` — Client list
- `/clients/[clientId]` — Client detail

## MVO Limitations

The Minimum Viable Offering (MVO) for LEXOS Litigation operates in **development mode only**:

- Local Supabase for data storage
- Mock CRM (local tables, not Odoo/Chatwoot)
- Mock Plane (local tables)
- Local file storage for evidence
- Shadow mode for legal research (no real API calls)
- No court filing submissions
- Single-user, single-tenant focus

## Schema References

Database schema will be implemented in follow-up work packets:

- WP-094: Core schema (clients, matters, evidence, assertions)
- WP-095: Workflow state tables
- WP-096: Artifact tables

## External Repository

Source LEXOS implementation: `/Users/linktrend/Projects/LiNKtrend-LEXOS`

## Documentation

- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` — Full conversion plan
- `.ai-swarm/LEXOS_VERTICAL_DISCOVERY.md` — Discovery report
- `packages/linklogic-sdk/src/lexos-contracts.ts` — Contract types
