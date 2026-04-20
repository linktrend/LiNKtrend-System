# Checklist: run the LiNKtrend Plugin with your own OpenClaw fork

You need **network reachability** from the plugin containers to:

1. **Supabase** (URL + keys in `.env`, same as LiNKaios uses).
2. **LiNKaios** (HTTPS base URL) if the plugin or fork calls LiNKaios APIs (for example brain `published` / `retrieve` — see `docs/linkbrain-openclaw-plugin-integration-spec.md`).
3. **Your fork’s governance ingress** — `bot-runtime` POSTs to `OPENCLAW_AGENT_RUN_URL`. That URL must accept the JSON body described in the root `README.md` (governance / `agent` params).

## Environment (minimum to review)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — only needed if you also build **LiNKaios** from this repo; `bot-runtime` / PRISM / gateway use server-side Supabase keys from `.env` as today.
- `SUPABASE_SECRET_KEY`, `DATABASE_URL` — as in `.env.example` for services that talk to Postgres/Supabase.
- `OPENCLAW_AGENT_RUN_URL` — **your** fork’s HTTP endpoint (not the shim in production).
- **Zulip** (if you use the gateway): `ZULIP_SITE_URL`, `ZULIP_BOT_EMAIL`, `ZULIP_BOT_API_KEY`, and optionally `ZULIP_GATEWAY_PORT` (default **8790**).

## Fork responsibilities

- Accept **`linktrendGovernance`** on the real gateway path (not only the stock webhook normaliser — see root `README.md` “OpenClaw fork handoff”).
- Keep **LiNKbot** and **LiNKtrend Plugin** versions documented so upgrades stay in sync.
