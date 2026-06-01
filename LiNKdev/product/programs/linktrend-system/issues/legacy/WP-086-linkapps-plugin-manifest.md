# WP-086 - LiNKapps Plugin Manifest Definition

## Objective

Create the concrete plugin manifest for `linkapps.app_factory` per `PLUGIN_ARCHITECTURE_V2.md` and `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-086-linkapps-plugin-manifest`
- Base: `development`

## Allowed files

- `plugins/vertical/linkapps/manifest.yaml`
- `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-086*.md`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/integration-agent.md`

## Prohibited files

- Moving LiNKapps code
- Implementation of stages or roles (declaration only)
- Changes to other plugins

## Required context

- `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §1, §3, §5, §7
- `PLUGIN_ARCHITECTURE_V2.md`
- `CONTRACTS_MVO.md` §1.2 (Plugin manifest contract)

## Acceptance criteria

- [ ] Complete `manifest.yaml` with all required fields
- [ ] `plugin_id`: `linkapps.app_factory`
- [ ] `plugin_kind`: `vertical`
- [ ] `modes_supported`: `["development"]` (MVO)
- [ ] All 7 Phase 5 stages declared with `responsible_plane`, `inputs`, `outputs`, `failure_mode`
- [ ] All 10+ LinkBot roles attached via `required_linkbot_roles[]`
- [ ] All required capability plugins listed in `required_capabilities[]`
- [ ] All required workflow hooks in `required_workflow_hooks[]`
- [ ] All required audit events in `required_audit_events[]`
- [ ] UI panels declared in `public_surfaces.ui_panels[]`
- [ ] `non_goals` explicitly listed

## Proof required

- Manifest file validates against `PLUGIN_ARCHITECTURE_V2.md` §1.3 validation rules
- Report lists any validation warnings or schema gaps
