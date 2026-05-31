# Suites

> **Canonical home** for tenant-enabled suite packages. Terminology: [`docs/terminology.md`](../docs/terminology.md).

**Suites** are tenant-enabled business or operational product packages. A tenant can enable one suite or many suites depending on what the client needs.

Suites replace the older broad use of `plugins/vertical`. The legacy `plugins/` layout is absorbed into suite packages or owning planes.

See `../docs/architecture/system-completion-targets.md` for completed-state targets for active suite families.

## What Belongs Here

- suite manifests
- one canonical workflow map per suite (`workflow.ts` or `workflow.md`)
- suite stage declarations (LiNKaios **Modules** — vendor recipes with phases, issues, assignees)
- suite UI surfaces
- suite-specific LiNKbot role references
- suite-specific audit event declarations
- suite-specific required capability connector lists (LiNKaios UI: **Capabilities**)
- compatibility wrappers for existing suite code during migration

## Canonical Workflow Map Pattern

Every active suite should expose a clear workflow map in its suite folder. The map defines what happens and in what order, while the owning planes provide the machinery.

Expected suite-level surfaces:

- `workflow.ts` or `workflow.md`: stages, dependencies, inputs, outputs, gates, and completion criteria.
- `roles.ts` or `roles.md`: LiNKbot roles per stage.
- `capabilities.ts` or `capabilities.md`: LinkSkills connector requirements and lease posture.
- `audit-events.ts` or `audit-events.md`: LiNKbrain events and memory objects.
- `plane-tasks.ts` or `plane-tasks.md`: Plane project/task shape.
- `manifest.ts` or `manifest.yaml`: LiNKaios suite registration.

Do not hide a suite's workflow only inside LiNKautowork handlers, LiNKbot role files, or old prompt documents. Those files can implement parts of the workflow, but the suite folder must remain the readable source of truth.

## What Does Not Belong Here

- external software forks
- capability connector implementations
- core memory, skill, workflow, or bot runtime engines
- tenant secrets or provider credentials

## Initial Suite Families

- `linksites`: WebsiteFactory lead-to-preview-site suite.
- `linkapps`: App factory suite for venture software creation.
- `linktrend-media`: Content and marketing production suite.
- `lexos/litigation`: First LEXOS legal practice area.
- `accounting`: Accounting department suite.
- `finance`: Finance department suite.
- `legal-department`: Legal operations suite.
- `business-development`: Venture pipeline and business development suite.
- `dental-clinic`: Future industry suite.
- `restaurant`: Future industry suite.

## Completed-State Target

A suite is operationally complete when it declares its workflow spine, UI surfaces, LiNKbot roles, LinkSkills capability connector requirements, LiNKautowork hooks, LiNKbrain audit/memory events, Plane tracking behavior, and tenant activation posture clearly enough that LiNKaios can run and display the work end to end.
