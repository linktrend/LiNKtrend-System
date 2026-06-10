# Docker: LiNKaios + LiNKtrend Services

This folder holds **Dockerfiles** for the current deployable service entrypoints:

| Image / service | Dockerfile | Published port |
|-----------------|------------|----------------|
| LiNKaios (`linkaios-web`) | `docker/linkaios-web.Dockerfile` | **3000** |
| `zulip-gateway` | `docker/zulip-gateway.Dockerfile` | **8790** |
| `bot-runtime` | `docker/bot-runtime.Dockerfile` | *(none — outbound only)* |
| `linkguard` | `docker/linkguard.Dockerfile` | *(none)* |

The **Compose file** lives at the **repository root**: `docker-compose.linktrend.yml`, so Docker can read your **`.env`** for both **build-time** and **runtime** settings.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Compose v2 installed and the **daemon running**.
- A filled-in **`.env`** at the **monorepo root** (copy from `.env.example`). At **image build** time, LiNKaios needs at least:

  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

  plus all server-side variables your deployment uses (see `.env.example`).

## Build and run (from repo root)

```bash
docker compose -f docker-compose.linktrend.yml build
docker compose -f docker-compose.linktrend.yml up
```

- **LiNKaios:** http://localhost:3000  
- **Zulip gateway health:** http://localhost:8790/health  

`bot-runtime` and LiNKguard only need outbound network access to Supabase (and `bot-runtime` to `OPENCLAW_AGENT_RUN_URL` when you set it).

## LiNKguard and disk paths

If you enable filesystem cleanup, set `LINKGUARD_RESIDUE_ROOTS` to **directories inside the container** and mount matching **volumes** from the host (example: add a `volumes:` block under the **`linkguard`** service in `docker-compose.linktrend.yml`). Do not point LiNKguard at host paths that are not mounted into its container. Legacy `PRISM_*` env names are still read as fallback when `LINKGUARD_*` is unset.

## Security notes

- Never commit `.env` or paste `docker compose config` output in public places; it expands secrets.
- Later you can replace `.env` with **Google Secret Manager** or another injector; the Compose file can stay and only the **secret source** changes.

## Friend checklist (own OpenClaw fork)

See `deploy/FRIEND-LINKTREND-PLUGIN.md`.

## Single image builds (without Compose)

From the monorepo root:

```bash
docker build -f deploy/docker/bot-runtime.Dockerfile -t linktrend-bot-runtime:local .
```

Same pattern for the other three Dockerfiles.

## Production VPS (linkdroplet-00)

One **Compose project name** per stack on the VPS. The LiNKaios monorepo stack uses project **`linkaios`** (set via `name:` in `docker-compose.deploy.yml` at repo root).

| Path on VPS | Compose file | Project name |
|-------------|--------------|--------------|
| `/opt/linktrend/linkaios` | `docker-compose.deploy.yml` | **`linkaios`** |
| `/opt/linktrend/n8n/deploy/prod` | `docker-compose.yml` | **`prod`** |
| `/opt/linktrend/cms` | `docker-compose.deploy.yml` | **`cms`** |
| `/opt/linktrend/linkbot-core` | `docker-compose.deploy.yml` | **`linkbot-core`** |
| `/opt/linktrend/traefik/deploy` | `docker-compose.yml` | **`deploy`** |

Traefik runs on external network **`linktrend-network`** (referenced as `traefik` in LiNKaios compose).

### LiNKaios deploy (canonical)

From `/opt/linktrend/linkaios`:

```bash
# Render runtime secrets (GSM → prod.env.runtime)
./ops/render-runtime-env-from-gsm.sh prod --output /opt/linktrend/runtime/linkaios/prod.env.runtime

# Build and (re)start — project name comes from compose `name: linkaios`
docker compose -f docker-compose.deploy.yml build
docker compose -f docker-compose.deploy.yml up -d --remove-orphans
```

Do **not** mix `-p linktrend-system` and `-p linkaios` for the same file; that creates duplicate containers. If orphans appear from an old project name:

```bash
docker compose -p linktrend-system -f docker-compose.deploy.yml down --remove-orphans
```

### Other stacks

```bash
# n8n + gateway + NATS
cd /opt/linktrend/n8n/deploy/prod && docker compose up -d --remove-orphans

# LinkSites CMS + app1
cd /opt/linktrend/cms && docker compose -f docker-compose.deploy.yml up -d --remove-orphans

# OpenClaw gateway (LiNKbot)
cd /opt/linktrend/linkbot-core && docker compose -f docker-compose.deploy.yml up -d --remove-orphans
```

### Health URLs (Tailscale / internal DNS)

| Service | URL |
|---------|-----|
| LiNKaios | `https://linkaios.linktrend.internal/login` |
| Zulip | `https://zulip.linktrend.internal` |
| CMS | `https://cms.linktrend.internal` |
| App1 preview | `https://app1.linktrend.internal` |
| n8n | `https://n8n.linktrend.internal` |
| LiNKbot gateway | `https://linkbot.linktrend.internal/healthz` |

### Internal TLS (no browser warning)

Staging uses Traefik on linkdroplet-00 with a **LiNKtrend internal CA** wildcard cert for `*.linktrend.internal` (Let's Encrypt cannot issue for private `.internal` DNS).

**Principal — one-time on each Mac:**

```bash
scp linkdroplet-00:/opt/linktrend/data/traefik/certs/linktrend-internal-ca.crt ~/Downloads/
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/Downloads/linktrend-internal-ca.crt
```

Then reopen the browser and visit `https://linkaios.linktrend.internal/admin` — padlock, no interstitial.

Canonical ops doc: `link-traefik` repo `deploy/README.md` (VPS path `/opt/linktrend/traefik/deploy`).

### LiNKbot-core (OpenClaw gateway)

From `/opt/linktrend/linkbot-core`:

```bash
./ops/render-runtime-env-from-gsm.sh prod --output /opt/linktrend/runtime/linkbot-core/prod.env.runtime
./ops/bootstrap-linkbot-state.sh
docker compose -f docker-compose.deploy.yml up -d --build --remove-orphans
```

Agents in `deploy/prod/openclaw.json`: `linksites-builder` (default), `linksites-ops`, `lisa`, `librarian`.

**bot-runtime → gateway (LiNKaios stack):** set in rendered linkaios runtime env:

```text
OPENCLAW_AGENT_RUN_URL=http://openclaw-gateway:18789/v1/linktrend/agent-run
OPENCLAW_RUN_AUTH_BEARER=<same as OPENCLAW_LINKTREND_RUN_BEARER on gateway>
```

Both stacks must attach **`linktrend-network`** so `openclaw-gateway` resolves from `bot-runtime`. Do not use `localhost:18789` from inside the LiNKaios containers.

Smoke test (external, Traefik):

```bash
curl -k -sS -X POST "https://linkbot.linktrend.internal/v1/linktrend/agent-run" \
  -H "Authorization: Bearer $OPENCLAW_RUN_AUTH_BEARER" \
  -H "Content-Type: application/json" \
  -d '{"message":"ping","idempotencyKey":"'"$(uuidgen)"'","agentId":"lisa","linktrendGovernance":{"bootstrap":{"traceCorrelationId":"smoke","authorizationState":"granted"},"approvedTools":{"toolNames":["read"]}}}'
```

Expect `"ok": true` and a `runId` (model reply depends on provider keys in gateway runtime env).

### Zulip env (Work → Messages + gateway)

LiNKaios **Open in Zulip** deep links read `ZULIP_SITE_URL` at runtime in the `linkaios` container (not a GSM secret — set as plain env in `deploy/prod/.env`).

| Variable | Purpose |
|----------|---------|
| `ZULIP_SITE_URL` | Zulip web app base URL, e.g. `https://zulip.linktrend.internal` |
| `ZULIP_INTERNAL_HOST_IP` | Tailscale IP for `zulip.linktrend.internal` (compose `extra_hosts`) |
| `ZULIP_TLS_INSECURE` | `1` when using internal CA (gateway curl/API probes) |
| `ZULIP_BOT_EMAIL_SECRET_NAME` | GSM name → rendered as `ZULIP_BOT_EMAIL` |
| `ZULIP_BOT_API_KEY_SECRET_NAME` | GSM name → rendered as `ZULIP_BOT_API_KEY` |

**GSM secrets (project `linkbot-901208`):**

- `LINKTREND_AIOS_PROD_ZULIP_BOT_EMAIL` — shared LiNKaios bot email
- `LINKTREND_AIOS_PROD_ZULIP_BOT_API_KEY` — shared LiNKaios bot API key
- Per-agent bots (OpenClaw profiles): `LINKTREND_AIOS_PROD_ZULIP_BOT_EMAIL_*` / `LINKTREND_AIOS_PROD_ZULIP_BOT_API_KEY_*` (see root `.env.example`)

**Render + apply on linkdroplet-00:**

```bash
cd /opt/linktrend/linkaios
# Ensure deploy/prod/.env includes ZULIP_SITE_URL (see deploy/prod/.env.example and prod.env.runtime.template)
./ops/render-runtime-env-from-gsm.sh prod --output /opt/linktrend/runtime/linkaios/prod.env.runtime
docker compose -f docker-compose.deploy.yml up -d --remove-orphans
```

Verify in container: `docker compose -f docker-compose.deploy.yml exec linkaios printenv ZULIP_SITE_URL`

Smoke (host or container with rendered env):

```bash
./scripts/zulip-live-proof.sh
```
