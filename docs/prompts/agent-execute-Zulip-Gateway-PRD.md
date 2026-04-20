# Agent prompt — Execute `docs/Zulip-Gateway-PRD.md` (v1 gateway ready)

Paste everything below the line into a **new Agent** chat. Repository root: **`LiNKtrend-System`**.

---

## Authority

Single source of truth: **`docs/Zulip-Gateway-PRD.md`**.  
Read **`apps/zulip-gateway/src/index.ts`**, **`zulip-payload.ts`**, **`zulip-send.ts`**, **`docs/zulip-routing.md`**, and **`packages/shared-config/src/index.ts`**.

## Goals

1. **Mission resolution §3:** Implement the documented priority order. Add a **pure** helper module (e.g. `resolve-mission-id.ts`) that takes `{ streamId, topic, overrideMissionId }` + async DB lookups (stream_routing, mission existence by UUID from topic). Wire **`m:<uuid>`** parsing (trim, case-insensitive `m`, validate UUID, optional existence check against `linkaios.missions`).

2. **Inbound webhook hardening:** Max body bytes (reject early). Optional **`ZULIP_INBOUND_WEBHOOK_SECRET`**: if set, require match on agreed header **or** query param; document in `docs/zulip-routing.md`. Add fields to **shared-config** schema.

3. **Tests:** Add **Vitest** to `apps/zulip-gateway` — tests for topic parser, resolution order with **mocked** Supabase client or injected async functions (no live Zulip required).

4. **Lint:** Replace `"lint": "echo \"no lint yet\""` with real **ESLint** (minimal flat config, align versions with `apps/prism-defender` or `apps/linkaios-web` where practical).

5. **Docs:** Update **`docs/zulip-routing.md`** with resolution order, env table, and “configure Zulip outgoing webhook” checklist including optional secret.

## Constraints

- Do **not** remove existing routes or break `bot-runtime` notify contract without documenting migration.
- **Backward compatible:** If inbound secret env is **unset**, current behavior (no secret) remains for existing deployments.

## Verification (must run and report)

```bash
pnpm --filter @linktrend/shared-types build   # if shared-config types change consumers
pnpm --filter @linktrend/zulip-gateway test
pnpm --filter @linktrend/zulip-gateway lint
pnpm --filter @linktrend/zulip-gateway build
```

If `linklogic-sdk` or `shared-config` change, run their builds/tests too.

## Deliverable

PR summary: new env vars, resolution order diagram (ASCII ok), test count, and any **LiNKaios** or Zulip server operator steps.

---

**Start by** quoting PRD §3 as you will implement it, then implement.
