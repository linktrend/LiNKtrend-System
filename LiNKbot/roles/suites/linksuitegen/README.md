# LiNKsuitegen suite roles

**Suite catalogue** uses separate role templates (modules → phases → issues → assignee).  
**Fleet runtime** uses **one** OpenClaw head (`admin-openclaw`) plus **Agent Zero** factory lane.

Canonical mapping: `openclaw-mapping.ts`.

## Fleet v1 runtime

| Runtime | Agent / lane | Role templates (assignee catalogue) |
| --- | --- | --- |
| OpenClaw `admin-openclaw` | Admin vendor + suite head | `suitegen_orchestrator_linkbot`, `handoff_coordinator_linkbot` |
| Agent Zero `az-suitegen-factory` | Factory analyst judgment | `discovery_analyst_linkbot`, `bop_architect_linkbot`, `validation_qa_linkbot`, `linksuitegen_crm_classifier_linkbot` |

Workspace: `LiNKbot-core/deploy/prod/workspaces/admin-openclaw` (parallel agent owns LiNKbot-core config).

Workflow map: `suites/linksuitegen/workflow.md`.
