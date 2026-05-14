# LiNKtrend Ecosystem Cursor Configuration

This `.cursor` folder is adapted from the LEXOS Cursor configuration for the broader LiNKtrend AI Agent Ecosystem build.

It supports development of:

- LiNKaios — organizational execution control plane
- LiNKbrain — institutional memory and learning plane
- LinkSkills — capability governance and capability lease plane
- LiNKautowork — deterministic workflow execution plane
- LinkBot — role-bound AI employee runtime adapter
- LinkSites / WebsiteFactory — first MVO vertical

## Priority Order

For this ecosystem build, agents must follow this priority order:

1. `.cursor/rules/`
2. `.ai-swarm/ARCHITECT_REVIEW_REPORT.md`
3. `.ai-swarm/MASTER_PLAN.md`
4. `.ai-swarm/ARCHITECTURE_RULES.md`
5. `.ai-swarm/CONTRACTS_MVO.md`
6. `.ai-swarm/REPO_INVENTORY.md`
7. `.ai-swarm/DECISIONS.md`
8. the assigned `.ai-swarm/WORK_PACKETS/*.md`
9. the relevant repo source files
10. `.cursor/skills/` and `.cursor/agents/`

The `.cursor/skills/` and `.cursor/agents/` files are selected reference capabilities only. They do not override `.ai-swarm/` work packets or architecture rules.

## Mandatory Development Posture

The project is not greenfield. Agents must first look for reusable existing code in active and archived repos before creating new code.

Known reuse anchors:

- `LiNKtrend-System` — LiNKaios monorepo and 12-route kernel UI
- `LiNKskills` — existing Phase 0–3 logic-engine
- `LiNKautowork` — existing n8n gateway MVO
- `Archive/LiNKaios/packages/linkbrain` — LinkBrain schema/migrations
- `LiNKsites` — Payload CMS website factory and templates
- `LiNKapps` — reusable UI/design-system ancestor
- `LiNKbot-core` — OpenClaw-based runtime fork
- `LiNKtrend-LEXOS` — later LawFirm vertical reference only, not first MVO

## First MVO

The first MVO is the LinkSites / WebsiteFactory lead-to-preview-site flow.

Agents must prioritize wiring the existing ecosystem loop:

LiNKaios → LinkBot → LinkSkills → LiNKautowork → LiNKbrain → LiNKaios trace/dashboard.

## Parallel Work

Parallel work is allowed only through `.ai-swarm/` work packets, separate branches or worktrees, explicit allowed/prohibited files, acceptance criteria, and final handoff reports.

## Non-Negotiables

- Do not merge your own work.
- Do not modify unrelated repos without explicit work-packet authority.
- Do not add major dependencies without a decision record.
- Do not rebuild what already exists unless the old code is unusable.
- If blocked by CRM, Plane, preview publishing, or third-party APIs, create a documented MVO stub and continue the flow.
