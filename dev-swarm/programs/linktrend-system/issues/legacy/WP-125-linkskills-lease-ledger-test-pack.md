# WP-125 - LinkSkills Lease Ledger Test Pack

## Objective

Add or harden tests around LinkSkills lease/capability ledger behavior across LinkSites, LEXOS, and LiNKapps contract surfaces.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-125-linkskills-lease-ledger-test-pack`
- Base: `origin/development`

## Allowed files

- `packages/linklogic-sdk/src/**lease*.ts`
- `packages/linklogic-sdk/src/**capability*.ts`
- `packages/linklogic-sdk/src/**/*test.ts`
- `dev-swarm/command-center/LINKSKILLS_LEASE_LEDGER_TEST_PACK.md`
- `dev-swarm/reports/legacy-ai-swarm/WP-125-linkskills-lease-ledger-test-pack.md`

## Prohibited files

- No LinkSkills service runtime implementation.
- No live provider calls.
- No database migrations.
- No broad SDK export rewrites unless tests require a narrow export.

## Required context

- `dev-swarm/command-center/CONTRACTS_MVO.md` §0.A.5.1
- `dev-swarm/command-center/LINKAPPS_CAPABILITY_REQUIREMENTS.md`
- `dev-swarm/command-center/LINKSKILLS_CROSS_VERTICAL_CAPABILITY_CATALOG.md`
- `packages/linklogic-sdk/src/contracts-mvo.ts`

## Steps

1. Inspect existing lease/capability schemas and tests in the SDK.
2. Add focused tests for lease required fields, idempotency key shapes, denial/failure mapping, and cross-vertical capability IDs.
3. Add minimal schemas/helpers only if a testable gap exists.
4. Run focused SDK tests and SDK build.
5. Update the packet-specific report.

## Acceptance criteria

- Tests cover lease/idempotency/failure mapping for at least LinkSites + one LEXOS + one LiNKapps capability surface.
- SDK build passes.
- No runtime provider behavior is added.

## Proof required

- SDK build output.
- Focused SDK test output.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
