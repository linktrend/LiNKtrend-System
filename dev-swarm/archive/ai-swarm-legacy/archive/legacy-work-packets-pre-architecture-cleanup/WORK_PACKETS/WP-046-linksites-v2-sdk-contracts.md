# WP-046 - LinkSites v2 SDK contracts

## Objective

Pin the LinkSites v2 wire-format contracts in `packages/linklogic-sdk` using the approved v2 docs and WP-042 discovery evidence.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-046-linksites-v2-sdk-contracts`

## Allowed files

- `packages/linklogic-sdk/src/contracts-mvo.ts`
- `packages/linklogic-sdk/src/contracts-mvo.test.ts`
- `packages/linklogic-sdk/src/index.ts`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`

## Prohibited files

- Do not edit `/Users/linktrend/Projects/LiNKsites`.
- Do not add Payload or Supabase migrations.
- Do not implement runtime orchestration or connectors.

## Required context

- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-046-linksites-v2-sdk-contracts.md`

## Steps

1. Add Zod schemas and TypeScript exports for LinkSites v2 identifiers, discovered template refs, site generation refs, capability plugin ids, workflow handles, role ids, and preview readiness summary.
2. Ensure failure-code usage stays aligned with `CONTRACTS_MVO.md` section 5.4.
3. Add focused tests proving valid v2 payloads pass and schema-inventing or live-side-effect cases fail.
4. Update the agent report with files changed, commands run, proof, blockers, branch, and commit SHA.

## Acceptance criteria

- SDK exports the new LinkSites v2 contract types.
- Tests cover success and boundary rejection cases.
- No target-software schema is invented.
- Existing SDK tests pass.

## Proof required

- `pnpm --filter @linktrend/linklogic-sdk test` or the repository's equivalent passing command.
