# WP-124 - Cross-System MVO Readiness Scorecard

## Objective

Create a machine-readable and human-readable readiness scorecard for all 8 systems, showing completion status, proof, blockers, and next closure actions.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-124-cross-system-mvo-readiness-scorecard`
- Base: `origin/development`

## Allowed files

- `dev-swarm/command-center/MVO_READINESS_SCORECARD.md`
- `dev-swarm/command-center/MVO_READINESS_SCORECARD.json`
- `dev-swarm/reports/legacy-ai-swarm/WP-124-cross-system-mvo-readiness-scorecard.md`

## Prohibited files

- No application code changes.
- No rewriting agent reports.
- No invented proof; cite existing reports/commands only.

## Required context

- `dev-swarm/reports/legacy-ai-swarm/*.md`
- `dev-swarm/programs/linktrend-system/issues/legacy/WP-090*.md` through `WP-123*.md` as present
- `dev-swarm/command-center/END_OF_DAY_VERIFICATION_QUEUE.md`
- `dev-swarm/command-center/DECISIONS.md`

## Steps

1. Review recent agent reports and integrated proof outputs.
2. Score LiNKaios, LiNKbrain, LinkSkills, LiNKautowork, LinkBot, LinkSites, LEXOS, and LiNKapps.
3. For each system, list complete proof, open blockers, and 1-3 closure actions.
4. Add JSON with the same scorecard data for future dashboard use.
5. Update the packet-specific report.

## Acceptance criteria

- All 8 systems have status, percent estimate, proof refs, blockers, and closure actions.
- No code changes.
- Scorecard distinguishes code blockers from environment/proof tasks.

## Proof required

- File listing and JSON validity check.
- Report with files changed, commands run, proof, blockers, branch, and commit SHA.
