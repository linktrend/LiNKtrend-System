# WP-061 - LinkSkills Database Schema and Migrations

## Objective

Create LiNKbrain database tables for LinkSkills capability catalog, lease ledger, idempotency cache, and kill switches with proper RLS policies for tenant isolation.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-061-linkskills-database-schema`
- Base: `development`

## Allowed files

- `packages/linkbrain-db/migrations/`
- `packages/linkbrain-db/schemas/linkskills/`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`
- `.ai-swarm/DECISIONS.md`

## Prohibited files

- Application code (this is schema-only packet)
- Old repo implementation files
- Changes to existing LiNKbrain audit tables (separate packet)

## Required context

- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md` §4.1-4.5
- `.ai-swarm/CONTRACTS_MVO.md` §6.2 (lease lifecycle)
- `/Users/linktrend/Projects/LiNKskills/SOP_MVO_CLASS_A.md` §5, §8, §10, §12
- WP-042 discovery results (if available)

## Steps

1. Create `linkskills.capabilities` table:
   - `capability_id` (PK, e.g., `cap.crm.odoo_shadow`)
   - `plugin_kind` ("capability")
   - `target_software` (e.g., "odoo", "payload_cms")
   - `allowed_operations` (JSONB array)
   - `auth_requirements` (JSONB)
   - `mode_flags` (text[]: development, shadow, live)
   - `lease_requirements` (text[])
   - `idempotency_rules` (text)
   - `audit_events` (text[])
   - `allowed_callers` (text[])
   - `failure_mapping` (JSONB)
   - `not_configured` (text[])
   - `version`, `created_at`, `updated_at`
   - RLS: tenant-scoped (system table, global read)

2. Create `linkskills.lease_ledger` table:
   - `ledger_entry_id` (UUID PK)
   - `tenant_id` (FK to linkaios.tenants)
   - `lease_id` (UUID)
   - `run_id` (UUID, FK to linkaios.runs)
   - `stage_id` (text)
   - `capability` (text, FK to capabilities)
   - `arguments` (JSONB)
   - `result` (JSONB)
   - `idempotency_key` (text)
   - `executed_at` (timestamptz)
   - `ledger_hash` (text - for tamper evidence)
   - RLS: tenant isolation

3. Create `linkskills.idempotency_cache` table:
   - `cache_key` (text PK - composite hash)
   - `tenant_id` (FK)
   - `idempotency_key` (text)
   - `capability` (text)
   - `payload_hash` (text)
   - `result` (JSONB)
   - `ledger_entry_id` (FK)
   - `created_at` (timestamptz)
   - `expires_at` (timestamptz) - 24h TTL
   - RLS: tenant isolation

4. Create `linkskills.kill_switches` table:
   - `switch_id` (UUID PK)
   - `tenant_id` (FK, nullable for global)
   - `capability` (text, nullable for global)
   - `switch_level` (int: 1=open, 2=halt, 3=emergency)
   - `state` (text: "open", "tripped")
   - `trigger_reason` (text)
   - `triggered_at` (timestamptz)
   - `triggered_by` (text)
   - `reset_at` (timestamptz, nullable)
   - `reset_by` (text, nullable)
   - RLS: tenant isolation + admin read

5. Create `linkskills.lease_requests` table (pending/executing leases):
   - `lease_id` (UUID PK)
   - `tenant_id` (FK)
   - `run_id` (UUID)
   - `stage_id` (text)
   - `capability` (text)
   - `arguments` (JSONB)
   - `idempotency_key` (text)
   - `status` (text: requested, granted, denied, requires_approval, executed, expired, revoked)
   - `requested_at`, `granted_at`, `executed_at`, `expires_at` (timestamps)
   - `denial_reason` (text, nullable)
   - `kill_switch_state_at_request` (text)
   - RLS: tenant isolation

6. Create indexes:
   - lease_ledger: (tenant_id, run_id), (tenant_id, capability), (executed_at)
   - idempotency_cache: (tenant_id, idempotency_key, capability)
   - lease_requests: (tenant_id, run_id), (tenant_id, status), (expires_at)

7. Create retention sweep function (integrates with LiNKbrain retention worker):
   - Delete expired idempotency cache entries
   - Archive old lease ledger entries per retention policy

8. Write migration files in `packages/linkbrain-db/migrations/`

## Acceptance criteria

- [ ] All 5 tables created with correct columns and types
- [ ] RLS policies enforce tenant isolation
- [ ] Foreign keys reference correct tables
- [ ] 24h TTL mechanism for idempotency cache
- [ ] Retention sweep function callable by LiNKbrain worker
- [ ] Migration files are reversible
- [ ] Schema documented in AGENT_REPORTS

## Proof required

- Migration applies cleanly
- Schema verification query output
- RLS policy test results

## Blockers

- WP-042 discovery should confirm LiNKbrain base table structure
- Coordinate with WP-006 if LiNKbrain audit table schema changes

## Notes

- Use Supabase/Postgres native features
- Align with `ARCHITECTURE_RULES.md` plane boundaries
- Kill switches table supports both per-tenant and global (null tenant_id)
