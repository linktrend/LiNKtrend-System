# WP-088 - LEXOS TypeScript Types Generation

## Objective

Generate TypeScript types from the adapted LEXOS schema for use in the LiNKaios plugin.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-088-lexos-types-generation`
- Base: `dev/cursor/WP-085-lexos-schema-core`

## Allowed Files

- `packages/linklogic-sdk/types/lexos/*.ts`
- `packages/linkaios-db/types/lexos/*.ts`
- `LiNKdev/product/programs/linktrend-system/issues/legacy/WP-088*.md`

## Prohibited Files

- Application logic
- UI components
- Server implementations

## Required Context

- `LiNKdev/product/grounding/LEXOS_VERTICAL_PLUGIN_CONVERSION_PLAN.md`
- `WP-085` output (adapted schema)
- `/Users/linktrend/Projects/LiNKtrend-LEXOS/src/types/database.ts`

## Steps

1. Run Supabase type generation against adapted schema
2. Copy/adapt domain types from LEXOS:
   - `src/types/domain.ts`
   - `src/types/intake.ts`
3. Create work request/response types per `CONTRACTS_MVO.md`
4. Export types from `packages/linklogic-sdk`

## Acceptance Criteria

- TypeScript types exist for all LEXOS tables
- Work request types follow `CONTRACTS_MVO.md` patterns
- Types are exported from `packages/linklogic-sdk`
- No TypeScript compilation errors

## Proof Required

- Type file listing
- Compilation output
- Type usage examples
