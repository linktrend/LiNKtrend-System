# Plane live integration proof — 2026-06-02

## Status: **OPERATIONAL** (live project create + mapping)

## Root cause (403 on `linktrend` slug)

The GSM API key `LINKTREND_AIOS_PROD_PLANE_API_KEY` is valid (HTTP 200 on `/api/v1/users/me/`). The blocker was **wrong workspace slug**, not token permissions.

| Probe | Result |
|-------|--------|
| `PLANE_WORKSPACE_SLUG=linktrend` | **403** — user/token not a member of a workspace with slug `linktrend` |
| `PLANE_WORKSPACE_SLUG=linkprojects` | **200** GET projects, **201** POST project |

**Canonical workspace (Plane DB on linkdroplet-01):**

| Field | Value |
|-------|--------|
| Slug | `linkprojects` |
| Name | LiNKprojects |
| Token user | `product@linktrend.media` (workspace role **20** = Admin) |
| Token type | Service token (`is_service=true`, label `LiNKaios Production`) |

Verified via `docker exec plane-api-1 python manage.py shell` on **linkdroplet-01**.

## HTTP proof

### List projects (200)

```bash
curl -sk -o /dev/null -w "%{http_code}\n" \
  -H "X-Api-Key: $PLANE_API_KEY" \
  "https://plane.linktrend.internal/api/v1/workspaces/linkprojects/projects/"
# -> 200
```

### Create project (201)

```bash
curl -sk -w "\nHTTP %{http_code}\n" -X POST \
  -H "X-Api-Key: $PLANE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Calusa LinkSites MVO proof","identifier":"CAL368413","description":"LiNKaios Calusa plane-sync proof"}' \
  "https://plane.linktrend.internal/api/v1/workspaces/linkprojects/projects/"
# -> 201
# plane_project_id: 70cf26c2-394a-4f6f-b788-b7c59c28c4e9
```

### Proof script (exit 0)

```bash
PLANE_API_BASE_URL=https://plane.linktrend.internal \
PLANE_WORKSPACE_SLUG=linkprojects \
NEXT_PUBLIC_PLANE_URL=https://plane.linktrend.internal \
NEXT_PUBLIC_PLANE_WORKSPACE_SLUG=linkprojects \
PLANE_API_KEY="$(gcloud secrets versions access latest --project=linkbot-901208 --secret=LINKTREND_AIOS_PROD_PLANE_API_KEY)" \
NODE_TLS_REJECT_UNAUTHORIZED=0 \
node scripts/proof-plane-calusa-sync.mjs
```

Output:

```json
{
  "plane_project_id": "e8a56aad-f574-4244-892f-57b822b1028e",
  "plane_project_identifier": "CALMPW1ADKW",
  "plane_url": "https://plane.linktrend.internal/linkprojects/projects/CALMPW1ADKW/"
}
```

## Calusa LinkSites mapping (Supabase)

| Field | Value |
|-------|--------|
| LiNKaios tenant | `calusa` (`e976eb75-1aff-4ca1-ad0d-5c940c343434`) |
| LiNKaios project id | `872ae237-b6a6-4408-95ff-24f7a7e5cdef` |
| Mapping row id | `7149b929-42f5-4a31-a522-b1449a4fa730` |
| Plane project id | `70cf26c2-394a-4f6f-b788-b7c59c28c4e9` |
| Plane identifier | `CAL368413` |

**Open in Plane URL:** https://plane.linktrend.internal/linkprojects/projects/CAL368413/

RPC used (same as `plane-project-sync.ts`):

```sql
select * from linkskills.upsert_plane_project_mapping(
  'e976eb75-1aff-4ca1-ad0d-5c940c343434'::uuid,
  '872ae237-b6a6-4408-95ff-24f7a7e5cdef',
  '70cf26c2-394a-4f6f-b788-b7c59c28c4e9'
);
```

## VPS env (linkdroplet-00) — applied

`/opt/linktrend/linkaios/deploy/prod/.env` and `/opt/linktrend/runtime/linkaios/prod.env.runtime`:

```env
LINKSKILLS_PLANE_MODE=live
PLANE_API_BASE_URL=https://plane.linktrend.internal
PLANE_WORKSPACE_SLUG=linkprojects
NEXT_PUBLIC_PLANE_URL=https://plane.linktrend.internal
NEXT_PUBLIC_PLANE_WORKSPACE_SLUG=linkprojects
MVO_TENANT_SLUG=calusa
PLANE_API_KEY_SECRET_NAME=LINKTREND_AIOS_PROD_PLANE_API_KEY
```

Applied:

```bash
./ops/render-runtime-env-from-gsm.sh prod --output /opt/linktrend/runtime/linkaios/prod.env.runtime
docker compose -f docker-compose.deploy.yml up -d --no-build --force-recreate linkaios
```

Container env verified: `PLANE_WORKSPACE_SLUG=linkprojects`, `LINKSKILLS_PLANE_MODE=live`.

**Note:** Full `docker compose build linkaios` on VPS failed on unrelated `@linktrend/autowork-gateway` TypeScript errors; runtime Plane vars do not require rebuild. Rebuild when integrating autowork gateway fix to refresh baked `NEXT_PUBLIC_PLANE_WORKSPACE_SLUG` in the client bundle.

## Implementation references

- Live adapter: `LiNKaios/linkaios-web/src/lib/kernel/plane-bootstrap.ts`
- Sync: `plane-project-sync.ts`, `project-plane-sync-handler.ts`
- Deploy template: `deploy/prod/.env.example` (slug corrected to `linkprojects`)

## Admin steps (only if creating a new workspace)

Not required for this fix. If a future workspace is added:

1. Plane → workspace **linkprojects** (or new workspace) → **Settings → API Tokens**
2. Create **Service token** (not personal token only) for LiNKaios
3. Store token in GSM as `LINKTREND_AIOS_PROD_PLANE_API_KEY`
4. Set `PLANE_WORKSPACE_SLUG` to the workspace **slug** from Plane settings (not display name)

Personal token for `product@linktrend.media` already has Admin (20) on `linkprojects`.
