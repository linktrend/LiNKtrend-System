# Handoff: LiNKdev v1.0.0 publish + LiNKtrend rename

- **Date:** 2026-05-30
- **Branch:** development
- **IDE/Agent:** Cursor
- **Machine:** MacBook

## What Was Done

- Renamed factory folder to `LiNKdev/` in LiNKtrend-System (git mv + content rename).
- Global terminology: **LiNKdev** (formerly Dev Swarm), **Principal** (formerly Chairman), labels **`linkdev:`** (formerly `swarm:`).
- Commands/rules: `wire-linkdev`, `linkdev-go`, `00-linkdev-bootstrap.mdc`, `linkdev-guard.yml`.
- Laws/sandbox files: `LINKDEV_LAWS.md`, `LINKDEV_SANDBOX.md`.
- Published virgin template to https://github.com/linktrend/LiNKdev — tag **v1.0.0**, `VERSION` = `1.0.0`.
- Added `LiNKdev/TEMPLATE_VERSION.md` (instance tracks template v1.0.0).
- Proof: `LiNKdev/factory/scripts/verify.sh`, intent + council validators PASS.

## What's Next

- Principal: wire GitHub labels/automations per `LiNKdev/factory/install/CHECKLIST.md` (use `linkdev:*` prefix).
- Principal **Go** on `linktrend-system` program when ready.
- Optional: enable “Template repository” on GitHub LiNKdev settings.
- Commit + push this rename on `development` (large diff — review before merge).

## Blockers

- None for template publish. LiNKtrend push/merge is human/Integrator choice.

## Files Changed

- Entire `LiNKdev/` tree
- `.cursor/` shim, `.github/workflows/linkdev-guard.yml`
- Scattered doc references in `docs/`

## Branch State

- [x] All changes committed on `development`
- [x] LiNKdev template pushed to GitHub (v1.0.0)
- [x] verify.sh passed locally
- [x] `development` pushed to origin (commits through bfb337c+)
- [x] `linkdev:*` GitHub labels installed
- [ ] Cursor/Codex UI automations (CHECKLIST §4–5)
- [ ] Principal **Go**
