# Docker: LiNKaios + LiNKtrend Plugin (task 2)

This folder holds **Dockerfiles** for the four containers we agreed on:

| Image / service | Dockerfile | Published port |
|-----------------|------------|----------------|
| LiNKaios (`linkaios-web`) | `docker/linkaios-web.Dockerfile` | **3000** |
| `zulip-gateway` | `docker/zulip-gateway.Dockerfile` | **8790** |
| `bot-runtime` | `docker/bot-runtime.Dockerfile` | *(none — outbound only)* |
| `prism-defender` | `docker/prism-defender.Dockerfile` | *(none)* |

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

`bot-runtime` and `prism-defender` only need outbound network access to Supabase (and `bot-runtime` to `OPENCLAW_AGENT_RUN_URL` when you set it).

## PRISM and disk paths

If you enable filesystem cleanup, set `PRISM_RESIDUE_ROOTS` to **directories inside the container** and mount matching **volumes** from the host (example: add a `volumes:` block under `prism-defender` in the Compose file). Do not point PRISM at host paths that are not mounted into its container.

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
