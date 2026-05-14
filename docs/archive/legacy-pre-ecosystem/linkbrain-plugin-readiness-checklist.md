# LiNKbrain plugin readiness checklist (separate agent / fork work)

**Purpose:** What a **separate engineer or agent** must do in the **LiNKbot-core / OpenClaw fork** and plugin layer so deployments are **ready to use LiNKbrain** (and the same pattern extends to LiNKskills, PRISM, Zulip).  
**Prerequisite:** LiNKaios exposes `/api/brain/published` and `/api/brain/retrieve` as documented in [`linkbrain-openclaw-plugin-integration-spec.md`](./linkbrain-openclaw-plugin-integration-spec.md); the fork’s `docs/linktrend-governance.md` repeats the bearer contract for implementers.

This is a **runbook**, not the LiNKbrain PRD. Product behaviour remains defined in [`LiNKbrain-PRD.md`](./LiNKbrain-PRD.md).

---

## 1. Configuration surface

- [ ] **Environment variables** (names illustrative; align with fork conventions):
  - [ ] `LINKAIOS_BASE_URL` — HTTPS origin for the LiNKaios deployment (no trailing slash ambiguity documented).
  - [ ] `BOT_BRAIN_API_SECRET` — Bearer secret issued per bot or per fleet cell; stored only in secrets manager / process env.
  - [ ] Optional: `LINKBRAIN_PREFETCH_PATHS` — comma-separated logical paths to warm at startup.
  - [ ] Optional: `LINKBRAIN_HTTP_TIMEOUT_MS`, retry caps.
- [ ] **Document** every variable in the fork’s operator docs with copy-paste examples for “one bot” vs “many bots” (same plugin, different env files).

---

## 2. HTTP client module (plugin)

- [ ] Implement a **small dedicated client** (no Supabase SDK in the fork) that:
  - [ ] Sends `POST /api/brain/published` and `POST /api/brain/retrieve` with JSON bodies per the integration spec.
  - [ ] Attaches `Authorization: Bearer <BOT_BRAIN_API_SECRET>`.
  - [ ] Parses responses using types aligned with `@linktrend/linklogic-sdk` where possible (shared types from monorepo or duplicated interfaces kept in sync).
- [ ] **Unit tests** with mocked HTTPS: 200 with body, empty published, 401, timeout.
- [ ] **No secrets** in logs; redact `Authorization` on debug traces.

---

## 3. Mapping governance context → brain parameters

- [ ] Read **`linktrendGovernance`** (or equivalent package metadata) already consumed by the fork for PRISM / policy.
- [ ] Derive **`scope`**, **`missionId`**, and **`agentId`** using the same canonical ids LiNKaios expects (see integration spec §3).
- [ ] Define explicit behaviour when ids are missing (skip brain vs narrow scope); add structured logging for operators.

---

## 4. Wiring into the read path (virtual files / memory)

- [ ] Identify the **code path** where OpenClaw resolves “memory” or virtual markdown files for the agent (workspace layer, gateway, or tool).
- [ ] For paths that are **designated LiNKbrain-backed** (e.g. `SOUL.md`, `memory/*`, deployment-specific list), **call `published`** instead of or before falling back to disk-only content.
- [ ] For **query-style** tools (“search the brain”), call **`retrieve`** with the same scope parameters.
- [ ] Ensure **fallback order** is documented: e.g. central published → local workspace file → empty with user-visible message.

---

## 5. Writes and drift control

- [ ] Confirm the plugin does **not** claim to “save brain” to Supabase via the bot secret unless a future **explicit append/publish** API is shipped and documented.
- [ ] Ensure **governance POST** from workspace (`/api/governance/...` on the gateway per existing fork docs) continues to work and uses **consistent** mission/agent identifiers with brain calls.
- [ ] If the product later adds **bot append-only logs**, add a separate task list gated on LiNKaios + SDK support.

---

## 6. Multi-bot operations

- [ ] Verify that **each process** can use a **different** `BOT_BRAIN_API_SECRET` and/or base URL without static globals.
- [ ] Smoke test **two** local bot processes against two LiNKaios tenants or two agents on the same tenant with different `agentId`.

---

## 7. Security review (minimal)

- [ ] TLS verification enabled for production; no “ignore SSL” except in dev flags.
- [ ] Secret rotation procedure documented (rotate secret in LiNKaios, update env, restart bot).
- [ ] Confirm RLS and publishing remain **server-side** only; the fork never receives a service role key for Postgres.

---

## 8. Observability

- [ ] Metrics or logs: request latency, status code histogram, cache hit rate if implemented.
- [ ] Operator-facing error messages when brain is unavailable (distinct from model errors).

---

## 9. Done criteria (sign-off)

- [ ] End-to-end: LiNKaios has a published virtual document for a test mission/agent; the bot run with the plugin **loads that content** in context or via tool.
- [ ] **Retrieve** returns sensible ranked chunks for a test query when server embeddings are on.
- [ ] Failure modes behave per [`linkbrain-openclaw-plugin-integration-spec.md`](./linkbrain-openclaw-plugin-integration-spec.md) §7.
- [ ] Documentation PR in the fork links **both** monorepo docs: integration spec + this checklist.

---

## 10. Relation to other plugin integrations

LiNKbrain is one of several central services mounted through the plugin. After brain readiness:

- **LiNKskills** — follow that product’s contract for tool registration and retrieval (do not implement inside `linktrend-governance` beyond hooks).
- **PRISM-Defender** — already oriented around governance signals; ensure new brain errors do not break PRISM event schema.
- **Zulip bridge** — configure webhooks and auth per bridge docs; no dependency on brain HTTP for basic message flow.

Keeping boundaries clean preserves the **skeleton bot + plugin** deployment story the operator described.
