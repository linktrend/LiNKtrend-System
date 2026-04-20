# Zulip-Gateway — Product Requirements (PRD)

**Status:** Draft (2026-04-15).  
**Scope:** `apps/zulip-gateway` only — inbound Zulip → Supabase + traces, outbound governance posts, health, security hardening, tests, and operator docs.  
**Out of scope:** OpenClaw/LiNKbot Zulip chat plugin (fork); full “presence” product; mapping Zulip users to LiNKbot identities (future).

**Parent context:** Monorepo PRD §5.2 / §10 (`docs/260414 - LiNKtrend Agentic System PRD.md`) — gateway is the **mission-aware adapter**, not the chat engine.

---

## 1. Definition — **gateway ready** (v1)

`zulip-gateway` is **ready** when:

1. **Inbound path** (`POST /webhooks/zulip`): Parses Zulip payload, persists to `gateway.zulip_message_links`, emits traces, and resolves **`mission_id`** using the **resolution order** in §3.
2. **Outbound path** (`POST /internal/tool-governance-notify`): Authenticated internal call posts a Zulip stream message and emits success/failure traces (existing behavior preserved or improved per §5).
3. **Topic convention:** Supports **`m:<uuid>`** (case-insensitive `m`, colon, 36-char UUID) in the message **topic** to set or override mission context per operator agreement with LiNKaios.
4. **Security:** Inbound webhook rejects or ignores unsigned traffic when **`ZULIP_INBOUND_WEBHOOK_SECRET`** (or agreed env name) is set (compare to query param or header documented in §7).
5. **Safety:** Request body size cap (e.g. 512 KiB) to avoid abuse; structured logs on reject.
6. **Quality:** **Vitest** for pure helpers (payload extract, topic parse, resolution order); **ESLint** replaces the `lint` stub; `pnpm` build/typecheck/test pass for `@linktrend/zulip-gateway`.
7. **Docs:** `docs/zulip-routing.md` updated with §3 resolution order, §7 env table, and Zulip server configuration checklist.

---

## 2. Principles

1. **LiNKtrend owns mission truth** in Supabase; the gateway **never** invents missions—only resolves or stores unresolved payloads.
2. **Deterministic resolution:** Same webhook shape + routing rows ⇒ same `mission_id` outcome (document order).
3. **Fail safe:** If resolution fails, still store the message and trace **`gateway.mission_unresolved`** (existing pattern).

---

## 3. Mission resolution order (normative)

When computing `mission_id` for an inbound message (before optional `?mission_id=` override is applied, or define override as **highest priority** — pick one and document):

**Recommended order (highest → lowest priority):**

1. **Query override** `?mission_id=<uuid>` if present and valid UUID and exists in `linkaios.missions`.
2. **Topic anchor:** If topic matches **`m:<uuid>`** (trim, first token or full-topic regex per implementation spec), use that UUID if it exists in `linkaios.missions`.
3. **Stream routing:** `gateway.stream_routing` for `zulip_stream_id` → `mission_id`.
4. Else **`mission_id` null** (trace `gateway.mission_unresolved`).

Outbound notify stream selection may remain as today (mission → routing row → env fallback → first row); optionally use same topic for governance messages (`m:<uuid> · tool request`).

---

## 4. Current baseline (do not regress)

- `POST /webhooks/zulip`, `POST /internal/tool-governance-notify`, `GET /health`.
- `zulip_message_links` upsert, `recordTrace`, `postZulipStreamMessage`.
- `docs/zulip-routing.md` tool-governance section.

---

## 5. Outbound governance notify

- Keep internal secret header behavior.
- Ensure **topic length** within Zulip limits (truncate safely).
- On misconfiguration, return clear status codes and trace (already largely present).

---

## 6. Observability

- Trace event names remain stable or versioned in docs if new events are added (e.g. `gateway.topic_mission_resolved` optional — not required if existing trace payload is enough).

---

## 7. Environment variables (v1 table)

| Variable | Required | Purpose |
|----------|----------|---------|
| `ZULIP_GATEWAY_PORT` | No | Listen port (default per code). |
| `SUPABASE_*` / `DATABASE_URL` | Yes | Service client for gateway + traces. |
| `ZULIP_GATEWAY_INTERNAL_SECRET` | For notify | Internal auth for `/internal/tool-governance-notify`. |
| `ZULIP_SITE_URL`, `ZULIP_BOT_EMAIL`, `ZULIP_BOT_API_KEY` | For outbound | REST post. |
| `ZULIP_FALLBACK_STREAM_ID`, `ZULIP_GOVERNANCE_TOPIC` | No | Notify routing / topic. |
| **`ZULIP_INBOUND_WEBHOOK_SECRET`** | No | If set, inbound webhook must present matching header or query param (document which). |

Add to `packages/shared-config` when implementing.

---

## 8. Acceptance criteria

- [ ] Resolution order §3 covered by unit tests (table-driven).
- [ ] At least one test for `m:<uuid>` topic parsing and invalid UUID handling.
- [ ] Inbound secret enforced when env set; ignored when unset (backward compatible).
- [ ] Body size limit returns 413 or 400 with no DB write.
- [ ] `pnpm --filter @linktrend/zulip-gateway test` + `build` + `lint` green.
- [ ] `docs/zulip-routing.md` matches shipped behavior.

---

## 9. Future (not v1)

- Sender → worker mapping; presence; DM-specific routing; multi-realm.

---

## 10. Document control

| Version | Date | Notes |
|---------|------|--------|
| 0.1 | 2026-04-15 | Initial PRD for v1 gateway completion. |
