# Create Codex automations (Codex computer use)

You are configuring **Codex** automations for Dev Swarm. Use computer use to navigate the Codex UI.

## Prerequisites

- Wire completed
- GitHub labels installed

## For each row in AUTOMATION-MANIFEST.md (Codex section)

1. Open Codex → Automations → Create.
2. Name exactly as manifest (e.g. `dev-swarm-executor-codex`).
3. Trigger: labels `swarm:ready` AND `runtime:codex` (both required).
4. Instructions: read `dev-swarm/factory/prompts/executor-codex/ROLE.md` and the issue file path from GitHub issue body or label-linked branch spec.
5. Save and enable.

Add program-specific Codex automations from `product/programs/*/PROGRAM.md` checklist tables.

## Handoff

Report in `dev-swarm/product/reports/wire-automation-setup.md`.
