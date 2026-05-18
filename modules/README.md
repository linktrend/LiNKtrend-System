# Modules

Modules are tenant-enabled business or operational packages. A tenant can enable one module or many modules depending on what the client needs.

Modules replace the older broad use of `plugins/vertical`.

See `../docs/architecture/system-completion-targets.md` for completed-state targets for active module families.

## What Belongs Here

- module manifests
- module workflow/stage declarations
- module UI surfaces
- module-specific LiNKbot role references
- module-specific audit event declarations
- module-specific required capability connector lists
- compatibility wrappers for existing module code during migration

## What Does Not Belong Here

- external software forks
- capability connector implementations
- core memory, skill, workflow, or bot runtime engines
- tenant secrets or provider credentials

## Initial Module Families

- `linksites`: WebsiteFactory lead-to-preview-site module.
- `linkapps`: App factory module for venture software creation.
- `linktrend-media`: Content and marketing production module.
- `lexos/litigation`: First LEXOS legal practice area.
- `accounting`: Accounting department module.
- `finance`: Finance department module.
- `legal-department`: Legal operations module.
- `business-development`: Venture pipeline and business development module.
- `dental-clinic`: Future industry module.
- `restaurant`: Future industry module.

## Completed-State Target

A module is operationally complete when it declares its workflow spine, UI surfaces, LiNKbot roles, LinkSkills connector requirements, LiNKautowork hooks, LiNKbrain audit/memory events, Plane tracking behavior, and tenant activation posture clearly enough that LiNKaios can run and display the work end to end.
