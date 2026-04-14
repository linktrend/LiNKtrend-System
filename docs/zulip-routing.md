# Zulip routing

## Database

- **`gateway.stream_routing`**: one row per Zulip `stream_id` (bigint primary key) pointing at `linkaios.missions.id`. Seed or edit via SQL or the LiNKaios Gateway page (read-only list in the UI; writes require operator role after migration `010`).
- **`gateway.zulip_message_links`**: inbound webhook payloads from `apps/zulip-gateway`, keyed by `zulip_message_id`.

Apply migrations in order: **`009_gateway_stream_routing.sql`** then **`010_operator_roles_rls.sql`**, or use the tail of **`services/migrations/ALL_IN_ONE.sql`**.

## Gateway service

- **`apps/zulip-gateway`**: `POST /webhooks/zulip` accepts JSON from Zulip. It resolves `mission_id` by looking up `stream_id` in `stream_routing`, or via optional query override `?mission_id=<uuid>` (must exist in `missions`).
- Traces: `gateway.message_linked` when a mission is resolved, `gateway.mission_unresolved` when it is not.

## Zulip server

Configure your Zulip outgoing webhook or bot to POST to the gateway URL. The Zulip application database is not part of this repo; only bridge tables in Supabase are used.
