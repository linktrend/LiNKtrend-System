# Wave 3 — Remaining TODOs (post UI/UX execution)

Completed in Wave 3 sweep (UI/mock): shell company switcher, org parent picker, company module deep links, LiNKbrain knowledge preview, vendor operator badge, stale Settings/Cockpit link cleanup, Stripe stub TODO marker.

## Requires schema / backend (do together)

| ID | Item | Notes |
|----|------|-------|
| UIUX-COMP-020 | Multi-company membership + RLS | Replace fixture switcher with tenant `companies` + `user_company_memberships` |
| UIUX-COMP-021 | Stripe live billing | Stripe Checkout + Customer Portal + webhooks; keys in GSM |
| UIUX-COMP-022 | Company ↔ LiNKbrain sync | Surface approved Inbox items with live publish state |
| UIUX-SET-006 | Full user CRUD | Create/deactivate humans; vendor AI agent accounts separate table |
| UIUX-MET-H001 | Live metrics scope filters | Wire module/project-type/workflow/issue to trace metadata when present |

## Product polish (next UI pass)

| ID | Item |
|----|------|
| UIUX-GLOBAL-001 | Full ShadCN init + multi-theme brand tokens |
| UIUX-GLOBAL-002 | LLM page help assistant |
| UIUX-GLOBAL-003 | Attention queue pattern on all remaining tables |
| UIUX-COMP-011 | Persist profile (website, industry, description, logo) to DB |
| UIUX-COMP-012 | Persist locations to DB |
| PM-001 | Repo-wide mission → project rename |

## Chairman rotation

After Stripe/GSM keys are wired, rotate any dev credentials used during this execution pass.
