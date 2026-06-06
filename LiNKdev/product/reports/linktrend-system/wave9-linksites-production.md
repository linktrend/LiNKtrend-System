# Agent Report: Wave 9 — LinkSites production

**Plan:** `STUDIO_FORWARD_PLAN.md` Wave 9 (deliverables 9.1–9.5)  
**Date:** 2026-06-06  
**Repos:** LiNKsites, LiNKtrend-System, LiNKautowork (n8n template)

## Summary

Wave 9 closes LinkSites production gaps after Area 1 proof: monorepo-root CMS Docker builds, Traefik wildcard `*.linktrend.internal` previews, fleet v1 runtime routing (`linksites-head` + AZ lanes), and governed outreach with Principal-approved live send (lease + audit + `autowork.linksites.outreach_dispatch`).

**Deferred:** Hetzner (Wave 12); live VPS re-proof on linkdroplet-00 (operator GSM + compose).

## Deliverables

| # | Item | Status |
|---|------|--------|
| 9.1 | CMS docker lockfile context | Done — `LiNKsites/deploy/docker/cms.Dockerfile` |
| 9.2 | Traefik wildcard preview | Done — `frontend-shared` + `HostRegexp` in `deploy/docker-compose.deploy.yml` |
| 9.3 | linksites-head + AZ lanes | Done — fleet mappings + `runtime-dispatch.ts` |
| 9.4 | Governed outreach send | Done — draft default; live requires `principal_approval` + lease |
| 9.5 | Kernel 13/13 staging | Partial — existing `mvo-latest-run.json`; VPS refresh after deploy |

## Verify locally

```bash
bash LiNKtrend-System/scripts/verify-wave9-linksites.sh
bash LiNKsites/scripts/verify-docker-build.sh   # optional; builds images
```

## Operator follow-up (DO)

1. `docker compose -f deploy/docker-compose.deploy.yml` from `/opt/linktrend/cms`
2. Import `linksites-outreach_dispatch.json` on linkdroplet-00 n8n
3. Re-run MVO publish; confirm `https://{slug}.linktrend.internal/en` returns 200
