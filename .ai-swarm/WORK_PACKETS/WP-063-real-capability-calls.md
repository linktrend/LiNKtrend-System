# WP-063 - Real Capability Plugin Integration

## Objective

Replace stub LinkSites v2 workflows with real Supabase and Payload CMS calls.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-063-real-capability-calls`
- Base: `development`

## Allowed Files

- `LiNKautowork/gateway/src/workflows/linksites-v2.ts` (modify)
- `LiNKautowork/gateway/src/lib/supabase-client.ts` (new)
- `LiNKautowork/gateway/src/lib/payload-client.ts` (new)
- `LiNKautowork/gateway/src/lib/linksites-v2.integration.test.ts` (new)

## Prohibited Files

- No schema invention (use WP-042 discovered schemas)
- No production credentials
- No changes to capability plugin contracts

## Hard Boundaries

- Development mode only (local Supabase/Payload)
- Schema must come from WP-042 discovery
- All writes gated by lease_id verification

## Required Context

- `CONTRACTS_MVO.md` §0.A.10.1 (LiNKautowork workflow contract pack)
- `LiNKautowork/gateway/src/workflows/linksites-v2.ts` (current stub implementation)
- WP-042 discovery results (schema location)
- WP-043 capability plugins (Supabase mirror, Payload sync)

## Technical Requirements

### Supabase Client

```typescript
interface SupabaseMirrorClient {
  upsertSiteContent(
    tenantId: string,
    siteId: string,
    siteGenerationRunId: string,
    content: Record<string, unknown>,
    leaseId: string
  ): Promise<{ mirrorWriteRef: string; revisionRef: string }>;
  
  upsertAssetRefs(
    tenantId: string,
    siteId: string,
    assets: Array<{ ref: string; kind: string }>,
    leaseId: string
  ): Promise<{ upsertedCount: number }>;
}
```

### Payload Client

```typescript
interface PayloadSyncClient {
  syncFromMirror(
    mirrorWriteRef: string,
    payloadTargetRef: string,
    leaseId: string
  ): Promise<{ 
    payloadSyncRef: string; 
    documentRefs: string[];
    status: string;
  }>;
  
  checkReadiness(
    payloadSyncRef: string,
    requirements: {
      requiredPages: string[];
      requiredNavigationItems: string[];
      requiredContentBlocks: string[];
      requiredMediaRefs: string[];
    }
  ): Promise<{ checksPassed: boolean; failedChecks: string[] }>;
}
```

### Lease Verification

Before any write operation:
1. Call LinkSkills to verify lease is valid and not expired
2. Check kill-switch state
3. Proceed only if lease granted

## Steps

1. Review WP-042 discovery for Supabase/Payload schemas
2. Implement Supabase mirror client using `@supabase/supabase-js`
3. Implement Payload CMS client using REST API
4. Modify workflow handlers to use real clients
5. Add lease verification calls before writes
6. Write integration tests (with local Supabase/Payload)
7. Update agent report

## Acceptance Criteria

- [ ] Supabase mirror client connects to local Supabase
- [ ] `supabase_mirror_upsert` creates actual rows in mirror table
- [ ] Payload sync client connects to local Payload CMS
- [ ] `payload_sync_local` creates actual documents in Payload
- [ ] `preview_readiness_check` queries real Payload data
- [ ] `crm_ready_to_contact_mark` updates mock CRM table
- [ ] All writes verify lease_id before executing
- [ ] Tests run against real (local) Supabase/Payload instances

## Proof Required

- Supabase Studio screenshot showing mirror rows
- Payload Admin screenshot showing synced documents
- Test output: `✓ writes to Supabase mirror`, `✓ syncs to Payload`, `✓ queries for readiness`
- Agent report with local service URLs

## Estimated Effort

6-8 hours (backend-specialist)

## Blockers

- WP-042 discovery must complete first (schema required)
- Local Supabase and Payload must be running

## Related

- `LINKAUTOWORK_COMPLETION_PLAN.md` Gap G4
- WP-042 (schema discovery)
- WP-043 (capability plugins)
- CONTRACTS_MVO.md §0.A.10.1 (5 workflow handles)
