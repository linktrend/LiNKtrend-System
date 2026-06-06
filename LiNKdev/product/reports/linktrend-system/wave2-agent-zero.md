# Agent Report: Wave 2 — Agent Zero production

**Plan:** `STUDIO_FORWARD_PLAN.md` Wave 2 (deliverables 2.1–2.8)  
**Repos:** `link-agentzero`, `LiNKtrend-System`  
**Branches:** `issue/wave2-agent-zero-fork-hygiene`, `issue/wave2-agent-zero-production`  
**Date:** 2026-06-06

## Summary

Wave 2 ships Agent Zero as a first-class LiNKbot runtime: eight named lanes, per-suite role→lane mappings, a TypeScript adapter with lease/audit/terminate + LiNKguard cleanup, VPS Docker/compose wiring, and bot-runtime dispatch that routes `agent_zero` roles away from OpenClaw.

## Deliverables

| # | Deliverable | Status | Evidence |
|---|-------------|--------|----------|
| 2.1 | link-agentzero fork hygiene | **Done** | `docs/UPSTREAM.md`, `docs/BRANCHING_AND_DEPLOYMENT_POLICY.md`, `.github/workflows/branch-source-policy.yml`, `development`/`staging`/`main` branches |
| 2.2 | `LiNKbot/runtime-adapters/agent-zero/` adapter | **Done** | Contract test `adapter.contract.test.ts`; session/mission/lease/event/terminate |
| 2.3 | `agent-zero-lanes.ts` — 8 lanes + queue names | **Done** | `agent-zero-lanes.test.ts` |
| 2.4 | Per-suite `agent-zero-mapping.ts` | **Done** | linksites, linksuitegen, linkdeveloper, platform/librarian + tests |
| 2.5 | Dockerfile + compose on linkdroplet-00 | **Done** | `deploy/docker/agent-zero.Dockerfile`, `docker-compose.deploy.yml` service `agent-zero`, health `GET /api/health` |
| 2.6 | GSM secrets / `.env.example` | **Done** | Root `.env.example`, `deploy/prod/.env.example`, `link-agentzero/deploy/linktrend-production/.env.example` |
| 2.7 | LiNKguard residue cleanup on AZ runs | **Done** | `linkguard-cleanup.ts` → `linkguard.cleanup_events` on terminate |
| 2.8 | bot-runtime dispatch to AZ adapter | **Done** | `runtime-dispatch.ts` + `runtime-dispatch.integration.test.ts` (116 bot-runtime tests green) |

## Test results

```text
pnpm --filter @linktrend/agent-zero-runtime test  → 1 passed
pnpm --filter @linktrend/bot-runtime test           → 116 passed
```

## VPS smoke (human/ops)

After GSM render on linkdroplet-00:

```bash
export LINK_AGENTZERO_BUILD_CONTEXT=/opt/linktrend/link-agentzero
docker compose -f docker-compose.deploy.yml up -d agent-zero --build
curl -k https://agentzero.linktrend.internal/api/health
```

Set `AGENT_ZERO_WORKER_URL=http://agent-zero:80` in linkaios runtime env; bot-runtime dispatches AZ-mapped roles via `dispatchRoleRuntime`.

## Integrator

Merge `issue/wave2-agent-zero-production` → `development` (LiNKtrend-System) and `issue/wave2-agent-zero-fork-hygiene` → `development` (link-agentzero) when review passes.
