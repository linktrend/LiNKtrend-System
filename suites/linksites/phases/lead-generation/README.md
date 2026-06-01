# LinkSites phase 1 — Lead generation (LTS-101)

Principal **D1 B:** one governed **mock demo lead** enters the pipeline with full lease, audit, and trace. This is not a skip stage; live Maps/search is post-MVO.

## Stage

| Field | Value |
|-------|--------|
| Stage ID | `linksites.lead_generation` |
| Primary plane | LiNKbot |
| Role | `lead_scout_bot` |
| CRM | mock/shadow via `cap.crm.odoo_shadow` |

## Mock demo lead (MVO)

| Field | Value |
|-------|--------|
| Lead ID slug | `mock-demo-lead` |
| Source | `mock_demo_lead` (governed fixture — not live Maps) |
| Acquisition mode | `mock` |
| Live Maps | blocked until Principal approval (`POLICY_REQUIRES_APPROVAL`) |

## Execution path

1. LiNKaios project run reaches `linksites.lead_generation`.
2. Kernel dispatches `lead_scout_bot` with LinkSkills lease reference.
3. Bot records `lead_record_ref`, `lead_provenance`, lease + audit refs (see LTS-040).
4. CRM shadow ref bound to run for downstream phases.

## Out of scope for MVO demo

- Live Google Maps or paid lead APIs
- Declaring lead generation as a permanent skip stage

## Proof

- `LiNKbot/runtime-adapters/openclaw/bot-runtime/src/mission.test.ts` — governed mock acquisition
- `suites/linksites/workflow-map.ts` — stage 1 spine
