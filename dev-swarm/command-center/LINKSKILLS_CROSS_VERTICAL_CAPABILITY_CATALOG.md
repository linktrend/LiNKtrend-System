# LinkSkills cross-vertical capability catalog (WP-114)

**Status:** declaration-only seeds + reconciliation (no runtime).
**Machine-readable seeds:** `packages/linkaios-kernel/plugins/capabilities/catalog/seeds/cross_vertical_catalog.v1.yaml`
**Loader checklist:** `packages/linkaios-kernel/plugins/capabilities/catalog/LOADER_GUIDANCE.v1.yaml`

## 1. Capability inventory — by source family

Sources are **documents and manifests pinned in-repo** — not inferred from unpublished verticals.

### 1.1 LinkSites MVO connector pack (`CONTRACTS_MVO.md` §0.A.5.1 table)

| `capability_id` | Approx. ops (contract table) | Default MVO mode posture |
|---|---|---|
| `cap.crm.odoo_shadow` | `lead.read_mock`, `lead.status.set_ready_to_contact`, `odoo.readiness.probe` | mock writes; shadow probes |
| `cap.accounting.odoo_shadow` | `ledger.summary.read_mock`, `invoice.status.read_mock`, `odoo.readiness.probe` | mock reads; shadow probes |
| `cap.payload.local_sync` | `content.upsert_local`, `preview.publish_local`, `sync.status.read` | mock default |
| `cap.supabase.mirror_content` | `site_content.upsert`, `asset_refs.upsert`, `mirror.status.read` | mock default |
| `cap.zulip.run_messaging` | `run.notify`, `channel.message.mock_send`, `connectivity.probe` | mock default |
| `cap.research.public_web` | `search.query`, `page.fetch`, `citation.extract` | mock or shadow reads |
| `cap.asset.generation` | `image.generate`, `video.generate`, `asset.metadata.record` | mock default |
| `cap.plane.execution_tracking` | `project.ensure_mock`, `task.ensure_mock`, `readiness.probe` | mock writes; shadow readiness |
| `cap.postiz.distribution` | `connectivity.probe`, `draft.create_mock`, `schedule.mock`, `status.read` | mock draft/schedule |

**Count:** 9 capability plugins — LinkSites-exclusive (plus shared IDs below reused by LiNKapps).

### 1.2 LiNKapps vertical (`plugins/vertical/linkapps/manifest.yaml` `required_capabilities`)

| `capability_id` | Relation to §0.A.5.1 |
|---|---|
| `cap.github.repo_management` | additive (not in LinkSites §0.A.5.1 table) |
| `cap.supabase.provisioning` | additive (`cap.supabase.mirror_content` is LinkSites sibling, not duplicate) |
| `cap.stripe.product_management` | additive |
| `cap.vercel.deployment` | additive |
| `cap.eas.build` | additive |
| `cap.plane.execution_tracking` | **shared** ID — CONNECTOR adds `sprint.track_stub` |
| `cap.zulip.run_messaging` | **shared** ID — SKU union adds `zulip.connectivity.probe` explicitly |
| `cap.research.public_web` | **shared** ID |
| `cap.asset.generation` | **shared** ID |
| `cap.postiz.distribution` | **shared** ID |

### 1.3 LEXOS capability plugins (`packages/linkaios-kernel/plugins/capabilities/lexos/*.yaml`)

| `capability_id` | Modes declared in LEXOS YAML | Lease permission namespace (hints) |
|---|---|---|
| `cap.extraction.parser` | `development` (`mode_flags.mvo_modes`) | `extraction.parser.*` |
| `cap.extraction.ocr` | `development` | `extraction.ocr.*` |
| `cap.extraction.qa` | `development` | `extraction.qa.*` |
| `cap.storage.evidence` | `development`; side-effect ops | `storage.evidence.*` |
| `cap.research.legal` | `shadow` default in YAML | `research.legal.*` |

---

## 2. Consolidated uniqueness count

- **Distinct `capability_id` values unioned across LinkSites §0.A.5.1, LiNKapps manifest, LEXOS manifests: 19.**

  - Nine connectors from §0.A.5.1.
  - LiNKapps adds five new IDs (`cap.github.repo_management`, `cap.supabase.provisioning`, `cap.stripe.product_management`, `cap.vercel.deployment`, `cap.eas.build`).
  - LiNKapps reuses five §0.A.5.1 IDs (`cap.plane.execution_tracking`, `cap.zulip.run_messaging`, `cap.research.public_web`, `cap.asset.generation`, `cap.postiz.distribution`).
  - LEXOS adds five orthogonal IDs (extraction OCR, parser, QA, evidence storage, legal research).

Detailed rows plus lease SKUs union and reconciliation notes appear in:

- `packages/linkaios-kernel/plugins/capabilities/catalog/seeds/cross_vertical_catalog.v1.yaml`

## 3. Overlapping surfaces (no aliasing)

| Topic | Decision |
|---|---|
| Parallel Supabase-named capabilities | **`cap.supabase.mirror_content` (sites mirror)** stays separate from **`cap.supabase.provisioning` (app factory scaffolding)** — same vendor family; different Connector contracts — see seed `overlaps_and_family_notes`. |
| `cap.plane.execution_tracking` ops | Canonical ID is one catalog row; LinkSites contract lists fewer operations than CONNECTOR-doc LiNKapps matrix — optional `sprint.track_stub` is a documented superset variance. |
| Zulip SKU lists | UNION CONTRACTS §0.A.5.1 table plus `LINKAPPS_CAPABILITY_REQUIREMENTS` so `zulip.connectivity.probe` is not dropped at registry time. |
| Research | **`cap.research.public_web`** and **`cap.research.legal`** must stay distinct IDs and SKU namespaces forever; no merge. |

## 4. Proof pointer

- Seeds list only stable handles / paths / policy text — confirm absence of literals in `dev-swarm/reports/legacy-ai-swarm/WP-114-linkskills-cross-vertical-catalog-seeds.md`.
