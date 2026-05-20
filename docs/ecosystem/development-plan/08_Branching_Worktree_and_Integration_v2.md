# Branching, Worktrees, And Integration v2

## Goal

Allow parallel agents to work without overwriting each other.

## Branches

Use separate branches:

```text
dev/architect
dev/repo-inventory
dev/linkaios-core
dev/linkbrain-mvo
dev/linkskills-mvo
dev/linkautowork-mvo
dev/linkbot-runtime
dev/linksites-flow
dev/integration
```

## Worktrees

If possible:

```text
/Users/linktrend/Projects/worktrees/
├── linkaios-core/
├── linkbrain-mvo/
├── linkskills-mvo/
├── linkautowork-mvo/
├── linkbot-runtime/
├── linksites-flow/
└── integration/
```

## Integration Rule

Specialist agents do not merge. They commit, report, and add to merge queue.

The Integrator reviews and merges into `dev/integration`.

## Repo Boundary Rule

If a work packet touches multiple repos, define primary repo and secondary repo. The agent must report all cross-repo changes.

## Contract Change Rule

No agent changes shared contracts casually. If a contract must change, update `CONTRACTS_MVO.md`, record in `DECISIONS.md`, then update code.

## Proof Rule

Every merge request must include proof:

- service boots
- endpoint works
- migration applies
- Docker command works
- UI renders
- demo step works
- tests pass if tests exist
