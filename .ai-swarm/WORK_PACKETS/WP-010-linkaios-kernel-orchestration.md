# WP-010 — LiNKaios kernel orchestration

## Objective

Implement the minimum LiNKaios kernel orchestration for tenant/plugin registration, manifest loading, work_request/run/stage lifecycle, approval hooks, and status/trace surfaces.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md` §§1, 3, 4, 5, 9, 10, 12.1
- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/DECISIONS.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md`
- `apps/linkaios-web`
- `packages/linklogic-sdk`
- `packages/db`
- `services/migrations/023_linkbrain_audit_envelope.sql`

## Allowed files

- `apps/linkaios-web/**`
- `packages/linklogic-sdk/**` only for imports and minor integration fixes after WP-005
- `packages/db/**` only for kernel persistence helpers
- `services/migrations/**` only for LiNKaios kernel tables if needed
- `services/migrations/**` only for a minimal LiNKbrain RPC wrapper if runtime proof shows the private `linkbrain` schema RPC is not callable by the service client
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`
- `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md` only for the RPC preflight note/result

## Prohibited files

- LinkBot reasoning implementation
- LinkSkills lease policy implementation
- LiNKautowork workflow implementation
- LiNKbrain audit schema redesign
- WebsiteFactory business logic beyond manifest dispatch glue
- Secrets or production deployment config

## Dependencies

- Start after WP-005 and WP-006 are complete.
- Coordinate with WP-007 for lease lifecycle calls.
- WP-011 depends on this packet for plugin declaration loading.

## Tasks

1. Inspect existing LiNKaios web/kernel routes and persistence patterns.
2. Implement tenant/plugin manifest registration and validation.
3. Implement `work_request` intake for `websitefactory.lead_to_preview`.
4. Implement `run` and `stage` lifecycle persistence with status transitions from `CONTRACTS_MVO.md` §4.
5. Implement dispatch adapters to LinkBot, LinkSkills, LiNKautowork, and LiNKbrain using shared contract types.
6. Verify the WP-006 LiNKbrain audit RPC runtime path:
   - First test the current private-schema call shape from `packages/linklogic-sdk/src/brain-audit.ts`: `createSupabaseServiceClient(env).schema("linkbrain").rpc("write_audit_event", ...)`.
   - If callable, keep the private-schema design and record proof.
   - If not callable because Supabase/PostgREST does not expose the private `linkbrain` schema, add a minimal wrapper function in the exposed API schema that delegates to private `linkbrain.write_audit_event`.
   - Keep the `SECURITY DEFINER` implementation in the private `linkbrain` schema; do not expose `linkbrain.audit_events` to anon/authenticated clients.
7. Implement minimal approval/routing hooks for `require_approval` stages.
8. Implement read-only status/trace surfaces that join by IDs and do not duplicate external-plane data.
9. Update `.ai-swarm/AGENT_REPORTS/linkaios-agent.md` and add the RPC preflight result to `.ai-swarm/AGENT_REPORTS/linkbrain-agent.md` if any wrapper or runtime caveat is discovered.

## Acceptance criteria

- Kernel loads WebsiteFactory manifest and rejects invalid manifests per contract.
- A valid lead input creates a `work_request`, `run`, and ordered `stage` records.
- Kernel never executes side effects or reasoning directly.
- Trace view exposes `lease_ids`, `workflow_run_ids`, and `audit_event_ids` by reference.
- LiNKaios can write `run.*` and `stage.*` audit events through the WP-006 audit writer, either via the private `linkbrain` schema RPC or a documented safe wrapper.
- Any wrapper keeps the private `SECURITY DEFINER` function private and does not expose `linkbrain.audit_events` directly.

## Required proof

- Test or smoke output showing manifest load, run creation, and at least one dispatched stage with trace refs.
- Proof of the LiNKbrain RPC path: private schema callable, or wrapper added with test/smoke output.
- Agent report documents files changed, commands run, and role-bleed checks.

## Out of scope

Writing the WebsiteFactory plugin implementation, building full UI polish, implementing external planes, real CRM/Plane/Vercel integrations, redesigning the WP-006 audit ledger.
