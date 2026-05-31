# WP-084 - LinkSites Local Artifact Storage Implementation

## Objective
Implement the `autowork.linksites.artifact_write_local` deterministic workflow in LiNKautowork.

## Recommended Model/Tool
Antigravity Gemini 3.1 Pro Low or Cursor.

## Context
As defined in the v2 LinkSites MVO, the `WebsiteBuilderBot` produces a structured `website_package`. Before this package is synced to the database, it must be persisted to a local generated-artifact folder as a durable record.

## Requirements
1. Create the workflow handle `autowork.linksites.artifact_write_local`.
2. Ensure inputs: `tenant_id`, `run_id`, `site_id`, `site_generation_run_id`, `artifact_bundle_ref`, `artifact_root_path`, `idempotency_key`.
3. Write the payload to the local filesystem inside the specified `artifact_root_path`.
4. Ensure outputs: `artifact_ref`, `artifact_manifest_ref`, `artifact_root_path`, `written_files_count`, `artifact_digest`.
5. Comply with the v2 failure mapping and LiNKbrain audit envelope.

## Allowed Files
- `packages/linklogic-sdk/src/workflows/linksites.ts` (or equivalent)
- `apps/linkautowork/src/workflows/linksites/artifact_write_local.ts`

## Prohibited
- Do not write to cloud storage. This is development-mode only.
