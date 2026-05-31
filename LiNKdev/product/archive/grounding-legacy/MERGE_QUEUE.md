# Merge queue

Track **merge-ready units of work** (PRs or equivalent) for the MVO build. Implementation has not started from the command center bootstrap; this file is ready for future use.

## Queue template

| ID | Title | Branch / PR | Risk | Status | Reviewer |
|----|-------|-------------|------|--------|----------|
| MR-001 | *example* | *link* | Low | Draft | |

## Active items

| ID | Title | Branch / PR | Risk | Status | Reviewer |
|----|-------|-------------|------|--------|----------|
| MR-001 | WP-013 proof-correction kernel patch (`getRunTrace` stage-ref aggregation) | `dev/minicodex/WP-015` | Low | Ready | Integration |
| MR-002 | WP-020/WP-024 kernel API tenant/run/approval authorization hardening | `dev/minicodex/WP-015` | High | Ready (SEC-001 fixed; 70 focused tests + fresh E2E passed) | Architect + Security |
| MR-003 | WP-021/WP-022 audit refs + fresh-run contract reproof for `CONTRACTS_MVO.md` §§8-10 | `dev/minicodex/WP-015` | Medium | Ready (WP-022 run `260f42aa-b2cc-415e-b89a-a0d619b8de85` and WP-023 run `9af1216f-4719-4191-94ef-fdf2b8b699f8` passed) | QA + Integration |

## Done

*Move completed rows here with merge date.*
