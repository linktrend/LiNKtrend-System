# WP-091 - LinkSites Supabase Mirror Upsert & Payload Sync

## Objective
Implement the `autowork.linksites.supabase_mirror_upsert` and `autowork.linksites.payload_sync_local` workflows to persist structured content.

## Recommended Model/Tool
Antigravity Gemini 3.1 Pro Low or Cursor.

## Context
Generated artifacts must be written to the Supabase mirror, and then synced down to the local Payload CMS.

## Requirements
1. Implement `autowork.linksites.supabase_mirror_upsert` requiring a LinkSkills `lease_id`.
2. Use the discovered `lsites_core` schema and `cms-mapping.json` from WP-042 to map data correctly.
3. Implement `autowork.linksites.payload_sync_local` requiring a LinkSkills `lease_id`.
4. Both workflows must use idempotency keys and return `LEASE_DENIED` or `LEASE_REQUEST_INVALID` on lease failures.

## Allowed Files
- `packages/linklogic-sdk/src/workflows/linksites.ts`
- `apps/linkautowork/src/workflows/linksites/supabase_mirror_upsert.ts`
- `apps/linkautowork/src/workflows/linksites/payload_sync_local.ts`

## Prohibited
- Do not invent new schemas in Payload or Supabase. Read what is there.
