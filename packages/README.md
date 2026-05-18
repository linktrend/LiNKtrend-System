# Packages

`packages/` contains reusable workspace libraries shared by the owning systems.

These are not standalone products or tenant modules. Keep code here only when more than one subsystem or deployable package needs the same typed contract, helper, SDK, UI primitive, config parser, or observability utility.

Current package roles:

- `auth`: shared auth helpers.
- `db`: Supabase/Postgres client helpers and generated database types.
- `linkaios-kernel`: reusable LiNKaios kernel contracts and capability declarations.
- `linklogic-sdk`: cross-plane contracts and SDK helpers used by LiNKaios, LiNKbrain, LinkSkills, LiNKautowork, and LiNKbot.
- `observability`: shared logging/tracing helpers.
- `shared-config`: environment parsing and shared runtime config.
- `shared-types`: cross-package TypeScript types.
- `ui`: shared UI primitives.

Do not put module-specific workflows, LiNKbot runtime code, LiNKbrain services, or capability connector implementation here unless the code is a reusable contract or helper consumed by multiple owners.
