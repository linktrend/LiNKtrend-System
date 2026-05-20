# LinkSites Schema Mapping Documentation

This document traces the LiNKautowork LinkSites adapter defaults to the discovered schema files from WP-042 discovery.

## Source of Truth

| Schema File | Path |
|-------------|------|
| CMS Mapping | `/Users/linktrend/Projects/LiNKsites/supabase/schemas/cms-mapping.json` |
| Core Schema | `/Users/linktrend/Projects/LiNKsites/supabase/schemas/lsites_core.schema.json` |

## Supabase Mirror Client Mapping

### Default Schema
- **Default Value**: `lsites_core`
- **Source**: `lsites_core.schema.json` → `"schema": "lsites_core"`
- **Environment Override**: `LINKAUTOWORK_SUPABASE_SCHEMA`

### Content Table (sites)
- **Default Value**: `sites`
- **Source**: `cms-mapping.json` → `"sites": { "table": "sites" }`
- **Environment Override**: `LINKAUTOWORK_SUPABASE_CONTENT_TABLE`
- **Columns Used**: `tenant_id`, `site_id`, `site_generation_run_id`, `lease_id`, `data`, `updated_at`
- **Conflict Resolution**: `on_conflict=tenant_id,site_id,site_generation_run_id`

### Asset Table (media)
- **Default Value**: `media`
- **Source**: `cms-mapping.json` → `"media": { "table": "media" }`
- **Environment Override**: `LINKAUTOWORK_SUPABASE_ASSET_TABLE`
- **Columns Used**: `tenant_id`, `site_id`, `site_generation_run_id` (null for assets), `lease_id`, `kind`, `ref`, `data`, `updated_at`

## Payload Sync Client Mapping

### Sync Collection (site-settings)
- **Default Value**: `site-settings`
- **Source**: `cms-mapping.json` → `"site-settings": { "table": "site_settings" }`
- **Environment Override**: `LINKAUTOWORK_PAYLOAD_SYNC_COLLECTION`
- **API Path**: `/api/site-settings`

### Readiness Collection (pages)
- **Default Value**: `pages`
- **Source**: `cms-mapping.json` → `"pages": { "table": "pages" }`
- **Environment Override**: `LINKAUTOWORK_PAYLOAD_READINESS_COLLECTION`
- **API Path**: `/api/pages?where[payloadSyncRef][equals]={ref}&limit=1`

## Lease and Idempotency Behavior

### Lease Requirements
Both `supabase_mirror_upsert` and `payload_sync_local` handlers require a valid `lease_id`:

```typescript
const leaseCheck = requireLeaseId(request);
if (!leaseCheck.ok) return { failure: leaseCheck.failure };
```

**Failure Code**: `LEASE_REQUEST_INVALID`
**Message**: `"Missing required lease_id for side-effecting workflow"`

### Idempotency
All workflow handlers preserve idempotency through the workflow-runner's cache:
- Same `idempotency_key` returns exact cached `WorkflowInvokeResult`
- Original `workflow_run_id` is preserved on replay

## Development Mode Fallback

When Supabase/Payload environment is not configured, handlers return deterministic fallback outputs:

### Supabase Mirror Upsert Fallback
```
mirror_write_ref: `supabase_mirror:${tenant_id}:${site_id}:${site_generation_run_id}`
mirror_revision_ref: `${mirror_write_ref}:${idempotency_key}`
upserted_records_count: 1
```

### Payload Sync Local Fallback
```
payload_sync_ref: `payload_sync:${tenant_id}:${site_id}:${site_generation_run_id}`
payload_document_refs: [`${payload_target_ref}:home`, `${payload_target_ref}:about`, `${payload_target_ref}:contact`]
payload_sync_status: "succeeded"
```

## Verification

Test command:
```bash
pnpm --filter @linktrend/autowork-gateway test -- src/workflows/linksites-v2.test.ts src/lib/linksites-v2.integration.test.ts
```

This validates:
- Lease requirement enforcement
- Schema-aware client calls
- Development fallback behavior
- Idempotency preservation
