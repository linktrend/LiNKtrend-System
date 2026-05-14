---
name: parallel-agents
description: LiNKtrend-controlled parallel work patterns. Use only when 2+ independent work packets can be executed without shared mutable state or unresolved dependencies.
---

# LiNKtrend-Controlled Parallel Agents

Use this skill only under `.ai-swarm/` work-packet control.

Parallel work is allowed when each task has:

- a work packet;
- a branch or worktree;
- allowed files;
- prohibited files;
- acceptance criteria;
- verification requirements;
- an agent report file;
- final handoff to the Integrator.

## Safe Parallel Examples

- A repo archaeologist verifies existing repos while the architect drafts contracts.
- A LinkBrain agent wires archived migrations while a LinkSkills agent wires capability leases.
- A LiNKautowork agent creates an n8n workflow while a LiNKaios agent builds the trace UI.
- A LinkBot agent builds the OpenClaw adapter while a frontend agent adds dashboard status panels.

## Unsafe Parallel Examples

- Two agents editing the same shared contract file.
- Two agents changing the same database migration.
- One agent changing LinkSkills contracts while another implements LinkBot against the old contract.
- Any agent modifying production credentials, deployment configs, or unrelated repos without approval.

## Required Handoff

Every parallel agent must update its report in `.ai-swarm/AGENT_REPORTS/` with:

- assigned work packet;
- files changed;
- commands run;
- proof produced;
- blockers;
- merge readiness;
- next recommended action.

The Integrator reviews and merges. Specialist agents do not merge their own work.
