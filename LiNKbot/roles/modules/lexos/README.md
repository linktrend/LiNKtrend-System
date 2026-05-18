# LEXOS Litigation LiNKbot Roles

Role definitions for the LEXOS Litigation module.

## Role Overview

| Role ID | Stage | Purpose | Plane |
|---------|-------|---------|-------|
| `lexos_intake_agent` | W0 | Process new client/matter intake | LiNKbot |
| `lexos_custodian_agent` | W1 | Maintain client master record | LiNKbot |
| `lexos_story_architect` | W2 | Create case master story | LiNKbot |
| `lexos_evidence_archivist` | W4 | Ingest and catalog evidence | LiNKbot + LiNKautowork |
| `lexos_analyst` | W5 | Map evidence to assertions | LiNKbot |
| `lexos_strategist` | W6 | Develop case strategy | LiNKbot |
| `lexos_librarian` | W7 | Conduct legal research | LiNKbot |
| `lexos_advocate` | W8 | Draft legal arguments | LiNKbot |
| `lexos_adversary` | W9 | Perform adversarial critique | LiNKbot |
| `lexos_rhetorician` | W11 | Refine output for persuasion | LiNKbot |

## Role Definitions

Each role definition includes:
- Purpose and responsibilities
- Allowed modules and capabilities
- Allowed skills and tools
- Memory/context rules
- Model/runtime profile
- Audit events
- Channel permissions
