# LiNKapps App Factory — LiNKaios UI panel design

**Status:** Design + static scaffold (WP-110)
**Vertical:** `linkapps.app_factory` (`plugins/vertical/linkapps/manifest.yaml`)
**Audience:** Integrator, frontend agents wiring kernel/plugin surfaces

---

## 1. Goals

- Give operators a **single LiNKaios surface** to watch Phase 5 (Technical Implementation): blueprint → squad → leases → deterministic workflows → handoff.
- Align panels with manifest **`public_surfaces.ui_panels`** without implementing backend dispatch or provisioning.
- Preserve **traceability**: every panel repeats `tenant_id`, `run_id`, `venture_id`, and shows cross-links to audit/run/trace vocabulary from `CONTRACTS_MVO.md` / squad spec.

---

## 2. Information architecture

| Manifest panel id | LiNKaios route (MVO scaffold) | Primary intent |
|-------------------|------------------------------|----------------|
| `linkapps.factory_dashboard` | `/linkapps/factory` | Composite status + phase strip |
| `linkapps.blueprint_intake` | Section on factory page | Submit/bind blueprint + PRD refs |
| `linkapps.squad_monitor` | Section on factory page | Role/task timeline vs stage DAG |
| `linkapps.build_logs` | Collapsible under workflow status | Build iteration feed (refs only in MVO) |
| `linkapps.validation_results` | Collapsible under workflow status | Pass/fail matrix stub |
| `linkapps.deployment_history` | Collapsible under workflow status | Preview URL fixtures |
| `linkapps.spinoff_queue` | Footer strip | Queued handoffs / venture spinoff |

Future packets may split sections into nested routes; this packet keeps **one page** to avoid routing churn.

---

## 3. Panel states and UX

### 3.1 Factory dashboard (header)

- **Idle:** No run selected; show venture/fixture picker placeholder copy only (no network).
- **Run active:** Show `status` chip (`running` | `succeeded` | `partial` | `failed`) aligned with manifest `preview_output_shape.status`.
- **Blocked:** Surface latest `FailureReport`-class message as plain text (mock string in scaffold).

### 3.2 Blueprint intake

- Fields (logical): `venture_id`, `blueprint_ref`, `prd_ref`, optional `app_slug` / `app_name`.
- States: **draft** (editable mocks), **validated** (inline checklist), **bound** (shows refs read-only).
- **No upload or provider calls** in MVO UI; buttons are inert or labelled “Mock only”.

### 3.3 Squad monitor

- Rows per **role_id** from manifest (`technical_lead`, `product_owner`, …): state `pending` | `active` | `done` | `failed`.
- Secondary column: **stage slice** (e.g. `linkapps.phase5.ai_implementation`) for orientation vs manifest `stages`.
- Ordering: kernel DAG order; parallel FE/BE shown with independent rows when spec allows.

### 3.4 Capability leases

- Table columns: `lease_id`, `capability` / SKU shorthand, `phase` (`requested` | `granted` | `executed` | `denied`), `retryable` flag.
- Empty state copy references **`LINKAPPS_CAPABILITY_REQUIREMENTS.md`** (mock-first posture).
- **No lease issuance** from this UI in MVO.

### 3.5 Workflow status (LiNKautowork)

- List `workflow_run_ids` from preview shape; map substages to manifest stages 5.2–5.7 for labels.
- Sub-panels: **build logs**, **validation**, **deployment** as stacked accordions with fixture lines (timestamp + ref).

### 3.6 Handoff pack output

- Show `handoff_package_ref`, `audit_event_ids`, `deployment_refs`, `preview_urls` as read-only lists.
- Download/actions are **disabled** or labelled fixture-only.

---

## 4. Run / trace visibility

- Persistent **context bar**: `tenant_id`, `run_id`, `trace_id` (fixture strings).
- **Audit spine:** chronological list of high-value verbs (`run.started`, `stage.completed`, `lease.granted`, `workflow.completed`, `linkapps.handoff.ready`) — ids only, no payload secrets.
- Deep links: placeholders for future `/settings/traces` or trace drawer integration (`href="#"` with `aria-disabled`).

---

## 5. Non-goals (this packet)

- Sidebar/nav integration elsewhere in LiNKaios (out of allowed file scope).
- Real GitHub, Supabase, Stripe, Vercel, EAS, Plane, Zulip calls.
- LinkSites UI changes.

---

## 6. Scaffold files (implementation pointer)

- `apps/linkaios-web/src/app/(shell)/linkapps/factory/page.tsx`
- `apps/linkaios-web/src/components/linkapps/*`
- `apps/linkaios-web/src/lib/plugins/linkapps/*`
