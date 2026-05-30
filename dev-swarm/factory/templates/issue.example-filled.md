---
id: LT-001
title: Example — first module issue after Go
runtime: cursor
tier: standard
module: linksites-mvo
phase: intake
depends_on: []
allowed_files:
  - modules/linksites/**
  - LiNKaios/linkaios-web/**
prohibited_files:
  - .env
read_first:
  - dev-swarm/factory/SPEC.md
  - dev-swarm/product/grounding/VISION.md
  - dev-swarm/product/grounding/SHIP_CRITERIA.md
  - dev-swarm/product/programs/linktrend-system/PROGRAM.md
  - dev-swarm/product/programs/linktrend-system/modules/linksites-mvo/README.md
  - dev-swarm/product/programs/linktrend-system/modules/linksites-mvo/phases/intake/issues/LT-001.md
read_forbidden:
  - dev-swarm/product/reports/**
  - dev-swarm/archive/**
  - dev-swarm/skills/**
acceptance_criteria:
  - Deliverable X is observable in dev environment
proof_required:
  - "curl or test command output in report proof block"
report_path: dev-swarm/product/reports/linktrend-system/linksites-mvo/intake/LT-001.md
prompt_path: dev-swarm/product/programs/linktrend-system/modules/linksites-mvo/phases/intake/prompts/LT-001.prompt.md
---

# LT-001 — Example filled issue

Copy this file when creating real issues; replace ids and bullets only.
