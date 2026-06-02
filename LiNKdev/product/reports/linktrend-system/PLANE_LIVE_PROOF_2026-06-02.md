# Plane live integration proof — 2026-06-02

## Implementation summary

- Live adapter: `LiNKaios/linkaios-web/src/lib/kernel/plane-bootstrap.ts` (Plane **v1 contract API**, `X-Api-Key`)
- Project create + sync: `plane-project-sync.ts`, `create-project-persistence.ts`, `project-plane-sync-handler.ts`
- UI: real Plane URLs from `linkskills.plane_project_mappings` when `LINKSKILLS_PLANE_MODE=live`
- VPS template: `deploy/prod/.env.example` (`LINKSKILLS_PLANE_MODE=live`, `MVO_TENANT_SLUG=calusa`)

## API evidence (staging Plane host)

Workspace slug probed: `linktrend` (configure via `PLANE_WORKSPACE_SLUG`).

```bash
# Auth + route reachable (service token recognized)
curl -sk -o /dev/null -w "%{http_code}\n" \
  -H "X-Api-Key: $PLANE_API_KEY" \
  "https://plane.linktrend.internal/api/v1/workspaces/linktrend/projects/"
# -> 403

# Response body
# {"detail":"You do not have permission to perform this action."}
```

**Interpretation:** GSM secret `LINKTREND_AIOS_PROD_PLANE_API_KEY` is valid (not 401) but the Plane service token must be granted **workspace/project write** on slug `linktrend` (or update `PLANE_WORKSPACE_SLUG` to the workspace the token owns). Code path is correct; unblock in Plane Admin → API tokens.

## VPS env (linkdroplet-00)

On `/opt/linktrend/linkaios`, ensure `deploy/prod/.env` includes:

```env
LINKSKILLS_PLANE_MODE=live
PLANE_API_BASE_URL=https://plane.linktrend.internal
PLANE_WORKSPACE_SLUG=linktrend
NEXT_PUBLIC_PLANE_URL=https://plane.linktrend.internal
NEXT_PUBLIC_PLANE_WORKSPACE_SLUG=linktrend
MVO_TENANT_SLUG=calusa
PLANE_API_KEY_SECRET_NAME=LINKTREND_AIOS_PROD_PLANE_API_KEY
```

Then:

```bash
./ops/render-runtime-env-from-gsm.sh prod --output /opt/linktrend/runtime/linkaios/prod.env.runtime
docker compose -f docker-compose.deploy.yml build linkaios
docker compose -f docker-compose.deploy.yml up -d --remove-orphans linkaios
```

## Calusa proof (after token permission fix)

1. Create LinkSites project in LiNKaios (tenant `calusa` via `MVO_TENANT_SLUG`).
2. Confirm `POST /api/projects/{id}/plane-sync` returns `planeSyncStatus: synced` and `planeUrl`.
3. Open Plane URL from project detail **Open in Plane**.
4. Record `plane_project_id` from response or `linkskills.plane_project_mappings`.

Proof script:

```bash
PLANE_API_BASE_URL=https://plane.linktrend.internal \
PLANE_WORKSPACE_SLUG=linktrend \
PLANE_API_KEY="$(gcloud secrets versions access latest --project=linkbot-901208 --secret=LINKTREND_AIOS_PROD_PLANE_API_KEY)" \
node scripts/proof-plane-calusa-sync.mjs
```
