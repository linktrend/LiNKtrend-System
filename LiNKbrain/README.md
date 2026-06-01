# LiNKbrain

LiNKbrain is the institutional memory and audit intelligence plane.

See `../docs/architecture/system-completion-targets.md` for the platform completion target.

## Owns

- event and audit ledger semantics
- memory objects
- retrieval and context assembly
- benchmark and learning loops
- trace intelligence views
- schemas and schema documentation
- references to canonical migrations

## Does Not Own

- LiNKbot personas or runtime execution
- LinkSkills leases or connector permissions
- LiNKautowork workflow execution
- LiNKaios tenant/module routing authority

## Current Migration State

LiNKbrain code is currently spread across:

- `supabase/migrations/*linkbrain*`
- `services/migrations/*linkbrain*`
- `packages/linklogic-sdk/src/brain-*`
- `LiNKaios/linkaios-web/src/components/linkbrain`
- `LiNKaios/linkaios-web/src/lib/linkbrain-data.ts`
- `LiNKdev/product/grounding/LINKBRAIN_*`

This folder is the canonical ownership home. Runtime code will move here in migration-safe waves with compatibility exports where needed. The LinkSites MVO audit contract is documented in `events/linksites-mvo-audit-schema.yaml`, with its current Supabase write path in `../supabase/migrations/20260601012600_lts_020_linkbrain_mvo_audit.sql`.

## Completed-State Target

LiNKbrain is operationally complete when audit envelopes cover all important reasoning, workflow, governance, approval, failure, and side-effect events; memory objects are derived with provenance; LiNKbots receive scoped context bundles; operators can inspect memory/audit state in LiNKaios; and benchmark/feedback loops can improve future work without leaking tenant data.
