# LiNKbrain Source Map

This file maps current compatibility code to the canonical LiNKbrain ownership home.

## Current Compatibility Locations

- `packages/linklogic-sdk/src/brain-*`: audit, memory, retrieval, embedding, benchmark, and virtual-file SDK helpers.
- `packages/linklogic-sdk/src/context-assembly.ts`: context bundle schema and assembly helpers.
- `services/migrations/*linkbrain*` and related `brain_*` migrations: current Postgres/Supabase persistence.
- `LiNKaios/linkaios-web/src/components/linkbrain/`: operator-facing LiNKbrain UI components.
- `LiNKaios/linkaios-web/src/lib/linkbrain-data.ts`: LiNKbrain UI data helpers.
- `LiNKaios/linkaios-web/src/lib/ui-mocks/linkbrain-demo-overlay.ts`: demo overlay for UI review.

## Migration Rule

Move implementation here only when package boundaries, imports, and deployment checks remain green. Until then, this folder is the source-of-truth ownership home and the map above tells agents where active compatibility code lives.
