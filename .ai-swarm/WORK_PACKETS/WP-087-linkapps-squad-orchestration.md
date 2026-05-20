# WP-087 - LiNKapps Squad Orchestration Design

## Objective

Define how LiNKaios coordinates multiple LinkBot agents as an autonomous squad for Phase 5 Technical Implementation.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/cursor/WP-087-linkapps-squad-orchestration`
- Base: `development`

## Allowed files

- `.ai-swarm/LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md`
- `.ai-swarm/WORK_PACKETS/WP-087*.md`
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`

## Prohibited files

- Implementation of orchestration logic
- Changes to LinkBot runtime
- Moving LiNKapps code

## Required context

- `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §3, §8.2
- `LiNKapps/.agent/ARCHITECTURE.md`
- `LiNKapps/.agent/agents/orchestrator.md`
- `CONTRACTS_MVO.md` §6.1 (LiNKaios ↔ LinkBot)

## Acceptance criteria

- [x] Squad formation protocol defined
- [x] Inter-agent communication contract specified
- [x] Artifact sharing mechanism designed
- [x] Role assignment algorithm documented
- [x] Failure/reassignment policy documented
- [x] Escalation paths defined
- [x] Concurrency limits specified

## Hard questions to answer

1. How does the orchestrator agent dispatch to specialist agents?
2. What is the squad communication protocol?
3. How are intermediate artifacts shared between squad members?
4. What is the escalation path when a squad member fails?
5. How many apps can one squad build simultaneously?

## Proof required

- Document answers all 5 hard questions
- Cross-reference to `CONTRACTS_MVO.md` §6.1 for LinkBot dispatch contract
- List any gaps requiring user decisions
