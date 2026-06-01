# WP-094 - LEXOS Core Schema Migration

## Objective

Copy and adapt LEXOS core identity and evidence schema (clients, matters, evidence, assertions) to LiNKaios plugin schema format.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-094-lexos-schema-core`
- Base: `dev/cursor/WP-084-lexos-vertical-plugin-conversion-plan`

## Allowed Files

- `packages/linkaios-db/migrations/lexos/*.sql`
- `packages/linkaios-db/schemas/lexos/*.sql`
- `.ai-swarm/WORK_PACKETS/WP-094*.md`
- `.ai-swarm/DECISIONS.md`

## Prohibited Files

- Moving actual LEXOS data
- Modifying `/Users/linktrend/Projects/LiNKtrend-LEXOS`
- Any application code

## Required Context

- `.ai-swarm/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/supabase/migrations/`

## Steps

1. Copy core migrations from LEXOS:
   - `20260511000002_identity_intake_clients_matters.sql`
   - `20260511000003_evidence_and_extractions.sql`
   - `20260511000004_assertions_support_risks.sql`

2. Adapt for LiNKaios plugin format:
   - Add `tenant_id` columns
   - Add `lexos_` prefix to table names
   - Update RLS policies for tenant isolation
   - Update foreign key references

3. Generate migration files with proper naming

4. Update DECISIONS.md with any schema changes

## Acceptance Criteria

- Core schema files exist in `packages/linkaios-db/migrations/lexos/`
- All tables have `tenant_id` columns
- All tables have `lexos_` prefix
- RLS policies enforce tenant isolation
- No modifications to source LEXOS repo

## Proof Required

- Schema file listing
- Migration SQL files
- Evidence of tenant_id columns
