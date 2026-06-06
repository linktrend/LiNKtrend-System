# Wave 10 — LiNKsuitegen production

**Plan:** `STUDIO_FORWARD_PLAN.md` Wave 10 (10.1–10.5)  
**Repos:** LiNKsuitegen + LiNKtrend-System  
**Date:** 2026-06-06

## Deliverables

| # | Deliverable | Status | Evidence |
|---|-------------|--------|----------|
| 10.1 | Factory API compose `:3099` | **PASS** | `LiNKsuitegen/deploy/docker-compose.linksuitegen.yml`, `apps/api/src/server.ts` |
| 10.2 | Discovery cron policy | **PASS** | `LiNKsuitegen/docs/operations/DISCOVERY_CRON_POLICY.md` |
| 10.3 | `simple_crm_lead_odoo_shadow` Admin publish proof | **PASS** | `admin-integration.test.ts` full handoff → publish |
| 10.4 | Factory analysts → `az-suitegen-factory` only | **PASS** | `agent-zero-mapping.test.ts` |
| 10.5 | `admin-openclaw` phase promotion | **PASS** | `orchestrator.ts` orchestrator role routing detail |

## Tests

```bash
cd LiNKsuitegen && pnpm test   # 13 passed
./scripts/verify-wave10-linksuitegen.sh
```

**Wave 10: PASS** (VPS systemd/compose deploy deferred; Hetzner deferred)
