# Capability catalog seeds (declaration-only)

This directory hosts **YAML seeds** consumed later by kernel / LinkSkills catalog loaders. WP-114 adds cross-vertical reconciliation only; **no runtime provider code** lives here.

## Layout

| Path | Purpose |
|------|---------|
| `LOADER_GUIDANCE.v1.yaml` | Validation expectations for future automated loading (schema hints, uniqueness rules). |
| `seeds/cross_vertical_catalog.v1.yaml` | Canonical capability rows merging LinkSites (CONTRACTS_MVO §0.A.5.1), LiNKapps manifest, LEXOS manifests. |

Authoritative LEXOS manifests live under `LiNKskills/capability-connectors/lexos/`. Seeds reference them by stable `capability_id` only.
