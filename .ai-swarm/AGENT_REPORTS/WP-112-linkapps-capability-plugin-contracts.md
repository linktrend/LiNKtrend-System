# WP-112 — LiNKapps capability plugin contracts

## Summary

Declaration-only YAML capability manifests for LiNKapps app-factory connectors were added under `packages/linkaios-kernel/plugins/capabilities/linkapps/`, plus `LINKAPPS_CAPABILITY_PLUGIN_CONTRACTS.md` mapping capability IDs to Phase 5 stages. No providers or LinkSkills runtime were implemented.

## Files changed

- `packages/linkaios-kernel/plugins/capabilities/linkapps/cap.github.repo_management.yaml`
- `packages/linkaios-kernel/plugins/capabilities/linkapps/cap.supabase.provisioning.yaml`
- `packages/linkaios-kernel/plugins/capabilities/linkapps/cap.stripe.product_management.yaml`
- `packages/linkaios-kernel/plugins/capabilities/linkapps/cap.vercel.deployment.yaml`
- `packages/linkaios-kernel/plugins/capabilities/linkapps/cap.eas.build.yaml`
- `packages/linkaios-kernel/plugins/capabilities/linkapps/cap.plane.execution_tracking.yaml`
- `packages/linkaios-kernel/plugins/capabilities/linkapps/cap.zulip.run_messaging.yaml`
- `.ai-swarm/LINKAPPS_CAPABILITY_PLUGIN_CONTRACTS.md`
- `.ai-swarm/AGENT_REPORTS/WP-112-linkapps-capability-plugin-contracts.md`

## Commands run

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-112 -b dev/cursor/WP-112-linkapps-capability-plugin-contracts origin/development
cd ../LiNKtrend-System-WP-112
git status --short --branch
```

### Manifest listing

```bash
find packages/linkaios-kernel/plugins/capabilities/linkapps -name '*.yaml' -type f | sort
```

### Proof — no default live write authority

Workspace `rg` was unavailable in PATH; used repository grep equivalent:

- `default_execution_mode` appears **7 times**, once per manifest, value **`mock`** in every file.
- Pattern `default_execution_mode:\\s*live` matches **0** files (no manifest defaults to live execution).

`live_execution_policy.status` is **`disabled_by_default`** in all seven manifests.

## Example manifest excerpt (`cap.github.repo_management.yaml`)

```yaml
default_execution_mode: mock
live_execution_policy:
  status: disabled_by_default
  requires_tenant_opt_in: true
  requires_distinct_lease_policies: true
```

## Branch / commit

- **Branch:** `dev/cursor/WP-112-linkapps-capability-plugin-contracts`
- **Commit (branch tip):** `25e5c4d`

## Blockers

- None.

## Next step

- WP-114 may reconcile these IDs with cross-vertical catalog seeds; kernel loaders may register `linkapps/` manifests when implementation packets land.
