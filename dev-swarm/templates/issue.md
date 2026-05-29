---
id: DS-000
title: Example issue title
runtime: cursor
tier: standard
module: bootstrap
phase: wave-0
depends_on: []
allowed_files:
  - dev-swarm/**
prohibited_files:
  - .env
  - "**/secrets/**"
acceptance_criteria:
  - Criterion is testable and observable (not "implement feature")
  - All allowed paths respected
proof_required:
  - "git status --short is clean except documented exclusions"
  - "Report updated with proof block"
report_path: dev-swarm/reports/DS-000.md
prompt_path: dev-swarm/programs/bootstrap/prompts/DS-000.prompt.md
---

# DS-000 — Example issue title

## Objective

One paragraph: what this issue must achieve.

## Context files

- `dev-swarm/SPEC.md`
- `dev-swarm/contracts/labels.md`
- (add program-specific paths)

## Steps

1. Step one
2. Step two

## Acceptance criteria

- [ ] Criterion is testable and observable (not "implement feature")
- [ ] All allowed paths respected

## Proof required

| Command | Expected |
|---------|----------|
| `git status --short` | Clean except documented exclusions |

## Handoff

- Commit on issue branch; push
- Update report at `dev-swarm/reports/DS-000.md`
- Do not set `swarm:merge-ready` until `dev-swarm/scripts/verify.sh` exits 0
