# LiNKaios UI/UX Review Backlog

## WP-226 Product Model Foundation Follow-up

- Backlog item: Replace repo-wide user-facing `mission` naming with `project` wording after UI/UX review and migration planning, while preserving internal compatibility fields until coordinated schema/runtime rename packets are approved.
- Scope note: This WP only adds shared UI guidance/constants and does not perform schema or runtime rewiring.

## WP-228 Projects + Plane Semantics Follow-up

- Backend wiring: Replace mock/fallback module and project-type metadata on live project detail/index with canonical module/project-type joins from kernel/project records.
- New Project flow: Wire `Module -> Project Type -> intake/start` UI to real create/start actions once approved API contracts are available.
- Plane bridge: Add per-project Plane IDs and sync telemetry so `Plane sync` shows real state beyond mock-safe placeholders.
- Terminology cleanup: Continue staged user-facing `Mission -> Project` copy updates in touched UI surfaces while preserving internal table/function compatibility names.

## WP-229 Follow-ups

- Wire worker project context to live source-of-truth fields for module, project_type, workflow_handle, issue refs, run refs, and trace refs instead of synthetic labels in `workers/[id]/projects`.
- Resolve workspace package linkage/module-resolution baseline issue (`@linktrend/shared-config`, `@linktrend/shared-types`, `@linktrend/linklogic-sdk`) blocking local compile and trustworthy browser proof in clean packet worktrees.

## WP-230 Follow-up Items

- Add explicit Issue Memory and Workflow Memory surfaces in LiNKbrain with the same client/vendor scope markers used for Company/Project/LiNKbot memory.
- Replace UI-only memory boundary badges with real role/scope enforcement sourced from retrieval permission checks.
- Add role-aware test coverage proving client users cannot access vendor `Project Type Knowledge` / `Vendor Module Memory` internals.
- Add end-to-end Ask LiNKbrain tests validating client-visible retrieval vs vendor-only/anonymized retrieval paths.
