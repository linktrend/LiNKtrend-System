# LEXOS Litigation Vertical Plugin

**Status:** MVO Scaffold (WP-122)  
**Version:** 1.0.0-mvo  
**Plugin ID:** `lexos_litigation`

## Overview

LEXOS (LiNKtrend Legal Operating System) is a litigation vertical plugin for LiNKaios, providing comprehensive case management with evidence-based assertion tracking for litigation matters.

## Architecture

LEXOS follows the Plugin Architecture V2 boundaries:

- **LiNKaios** coordinates tenant, work requests, and UI
- **LinkSkills** governs capability leases and permissions
- **LiNKautowork** executes deterministic workflows (evidence ingestion, extraction)
- **LiNKbot** performs judgment work across 10 litigation-specific roles
- **LiNKbrain** maintains event ledger and audit trail

## Workflow Stages (W0-W11)

| Stage | Name | Plane | Panel |
|-------|------|-------|-------|
| W0 | Client Onboarding | LiNKbot | IntakeWorkspace |
| W1 | Client Master | LiNKbot | MatterOverview |
| W2 | Case Story | LiNKbot | StoryWorkspace |
| W4 | Evidence Intake | LiNKautowork | EvidenceWorkspace |
| W5 | Support Matrix | LiNKbot | AssertionsWorkspace |
| W6 | Strategy | LiNKbot | StrategyWorkspace |
| W7 | Research | LiNKbot | ResearchWorkspace |
| W8 | Argument | LiNKbot | ArgumentWorkspace |
| W9 | Adversarial | LiNKbot | AdversarialWorkspace |
| W11 | Output | LiNKbot | OutputWorkspace |

## Directory Structure

```
plugins/vertical/lexos/
├── ui/
│   ├── layouts/          # Layout components (AppShell, Subnav, etc.)
│   ├── components/       # Shared UI components
│   ├── workspaces/       # Workspace panel components
│   ├── hooks/            # React hooks
│   └── types/            # TypeScript definitions
├── manifest.yaml         # Plugin manifest
└── README.md             # This file
```

## LiNKbot Roles

- `lexos_intake_agent` — Process intake, conflict check, KYC/CDD
- `lexos_custodian_agent` — Maintain client master record
- `lexos_story_architect` — Create case master story
- `lexos_evidence_archivist` — Ingest and catalog evidence
- `lexos_analyst` — Map assertions to evidence
- `lexos_strategist` — Develop case strategy
- `lexos_librarian` — Conduct legal research
- `lexos_advocate` — Draft legal arguments
- `lexos_adversary` — Perform adversarial critique
- `lexos_rhetorician` — Refine final output

## Development Mode (MVO)

The MVO implementation operates in development mode only:

- Local Supabase for data storage
- Mock CRM (local tables)
- Local file storage for evidence
- Shadow mode for legal research APIs
- No court filing integration
- Human approval required for intake acceptance

## Non-Goals

- Multi-jurisdiction support
- Real court filing
- Certified transcription/translation
- Forensic chain-of-custody automation
- Production email/calendar integration
- Billing/time tracking
- Document comparison
- Advanced visual exhibits (W10 deferred)
- Real-time collaboration
- Mobile-native apps

## Related Work Packets

- WP-084: LEXOS Vertical Plugin Conversion Plan
- WP-094: LEXOS Core Schema Migration
- WP-097: LEXOS Type Generation
- WP-103: LEXOS Capability Manifests
- WP-104: LEXOS LiNKbot Role Contracts
- WP-105: LEXOS Autowork Workflow Hooks
- WP-122: LEXOS UI Workspace Scaffold (this packet)
