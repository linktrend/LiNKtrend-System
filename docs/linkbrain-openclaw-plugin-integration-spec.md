# LiNKbrain ↔ OpenClaw plugin integration specification

**Audience:** Engineers implementing LiNKaios (LiNKbrain), the LiNKbot-core plugin layer, and the OpenClaw fork runtime.  
**Status:** Specification for the **target** integration once LiNKbrain is delivered per [`LiNKbrain-PRD.md`](./LiNKbrain-PRD.md).  
**Related:** [`LiNKbrain-PRD.md`](./LiNKbrain-PRD.md); in the **LiNKbot-core** OpenClaw fork, `docs/linktrend-governance.md` (often checked out beside this monorepo; see root `README.md`) documents the **HTTP bridge** contract for `/api/brain/published` and `/api/brain/retrieve`.

---

## 1. Architectural role

The operator’s mental model is correct and should be preserved in documentation and code:

- **LiNKaios (LiNKbrain)** is the **system of record** for governed brain content: virtual documents, versions, approvals, org and project bindings, embeddings, and retrieval.
- **LiNKskills**, **PRISM-Defender**, and the **Zulip communications bridge** are **separate product surfaces** in the monorepo that also integrate **through the same plugin boundary** (configuration, hooks, outbound/inbound adapters). This document specifies the **LiNKbrain slice** only; other capabilities have their own PRDs and should not be reimplemented inside the fork.
- The **OpenClaw fork + LiNKbot-core plugin** is the **runtime shell**: process model, model calls, tool orchestration, local governance hooks, and optional **mirroring** of central truth over HTTPS.
- **One bot process, one plugin configuration** scales to **many** deployments: each bot carries the same plugin package and is differentiated by **environment** (LiNKaios base URL, secrets, mission/agent identity, optional feature flags).

The bot does **not** embed Supabase or LiNKbrain business logic for authoritative writes; it **delegates** to LiNKaios for brain I/O that must respect RLS and publishing rules.

---

## 2. Trust boundaries

| Zone | Holds | Must not |
|------|--------|----------|
| **LiNKaios** | Postgres, RLS, virtual file rows, inbox, embeddings, retrieval implementation | Assume anything about OpenClaw’s internal tool names beyond published HTTP contracts |
| **Plugin** | HTTP clients, caching policy, mapping from governance context → API parameters, feature flags | Store authoritative brain copies except as an explicit, documented cache |
| **Fork runtime** | `linktrendGovernance` payload from workspace, local engine state, PRISM signal emission | Implement LiNKbrain persistence or LiNKskills retrieval backends |

---

## 3. Identity and scope (brain API parameters)

LiNKbrain partitions content by **primary anchor** (company vs one project vs one LiNKbot) per the PRD. The HTTP bridge must receive enough information to resolve **published** markdown and **retrieval** indices without the bot holding database credentials.

**Recommended mapping from runtime to API:**

- **`scope: "company"`** — Organisation-wide published material (e.g. SOUL, shared playbooks) when the deployment is company-scoped.
- **`scope: "mission"`** — Project-scoped material; **`missionId`** is the stable LiNKaios project UUID (or the monorepo’s canonical project id type used in brain tables).
- **`scope: "agent"`** — LiNKbot-scoped material; **`agentId`** is the stable LiNKbot / agent identity UUID used as the brain partition key.

The plugin **derives** `missionId` and `agentId` from the same sources already used for `linktrendGovernance` (workspace package metadata and/or environment). If a field is absent, the plugin must not guess: call the API with the narrowest scope that is valid, or skip brain fetch and log a structured warning.

**`logicalPath`** is the virtual path string (e.g. `SOUL.md`, `memory/2026-04-15.md`) as defined in LiNKaios and the linklogic SDK. Normalisation (leading slash, case) must match the server’s canonical rules; the spec of paths belongs with the virtual file layer migration and SDK.

---

## 4. Authentication

- **Bot → LiNKaios (read published, retrieve):** `Authorization: Bearer <BOT_BRAIN_API_SECRET>` on every request. The secret is **deployment-scoped**; it is not the operator JWT and not the end-user’s key.
- **Operator → LiNKaios (UI):** Session or role JWT as today; irrelevant to the plugin except for documentation of who may approve publishes.

The plugin must **never** log the full secret or embed it in workspace files committed to git. Use environment injection only.

---

## 5. HTTP contracts (canonical)

These endpoints are the **contractual surface** between plugin and LiNKaios. Exact request/response shapes should stay aligned with `@linktrend/linklogic-sdk` types where referenced.

### 5.1 Published virtual file (full body)

- **Method:** `POST`
- **Path:** `/api/brain/published`
- **Body (JSON):** `{ "scope": "company" | "mission" | "agent", "logicalPath": string, "missionId"?: string, "agentId"?: string }`
- **Response:** `{ "fileId": string | null, "body": string }` — `body` is markdown (or empty string when no published version exists).

**Semantics:** Returns the **current published** content for that path and partition. Draft-only or inbox-only states must not be returned here.

### 5.2 Retrieval (passages + index cards)

- **Method:** `POST`
- **Path:** `/api/brain/retrieve`
- **Body (JSON):** `{ "scope", "logicalPath", "query", "missionId"?, "agentId"?, "topK"? }`
- **Response:** Same shape as **BrainRetrieveContextResult** from `@linktrend/linklogic-sdk` (ranked chunk excerpts, index cards, semantic behaviour when the server has embedding provider configuration).

**Semantics:** Supports **Ask-style** passage surfacing for tools or prompt assembly. The plugin should treat this as **read-only** and suitable for caching with a short TTL if needed.

### 5.3 Future: append-only runtime logs (optional extension)

The PRD treats **daily logs** as append-only for humans; if product later requires **bot-origin append** (e.g. structured log lines to a mission/agent log path), that should be a **separate** authenticated route (e.g. `POST /api/brain/append`) with strict rate limits and path allowlists. Until that route exists and is documented in the SDK, the plugin must **not** simulate writes via generic APIs.

---

## 6. When the plugin calls LiNKbrain

**Read path (required for parity with central truth):**

- **Session / turn start:** Optionally prefetch high-value paths (`SOUL.md`, `USER.md`, `memory/HEAD.md` or deployment-specific list) to inject into context or to refresh a local mirror.
- **Tool or command that reads a virtual file:** Prefer **published** fetch by path; use **retrieve** when the user or tool supplies a natural-language query over a bounded path or partition filter.
- **After receiving `linktrendGovernance` updates from the workspace:** If governance references a mission or agent id, reconcile brain scope parameters before the next fetch.

**Write path:**

- **Runtime → brain:** Any durable write that must appear in LiNKaios (uploads, edits, approvals) goes through **operator flows** or **automation with service credentials** in the monorepo, not through the bot’s bearer secret unless a dedicated append/publish API is explicitly added for bots.
- **Governance POST from workspace:** Continues to hit the fork’s existing endpoint; that path is **orthogonal** to LiNKbrain persistence but should use **consistent** mission/agent ids so brain and governance stay aligned.

---

## 7. Failure modes and behaviour

| Condition | Plugin behaviour |
|-----------|------------------|
| **401 / 403** | Do not retry with backoff indefinitely; surface diagnostic once; fall back to local-only files if policy allows. |
| **404 on route** | Configuration error (wrong base URL or old LiNKaios); log version mismatch hint. |
| **`fileId: null` / empty body** | Treat as “no published document”; do not invent content. |
| **Timeout** | Bounded retries with jitter; then degrade gracefully. |
| **Partial scope** (missing `missionId` for `scope: "mission"`) | Do not call the API; log structured field `brain_scope_incomplete`. |

---

## 8. Caching and consistency

- **Default:** Treat published fetches as **eventually consistent** with the UI (seconds lag after publish is acceptable unless product states otherwise).
- **Optional:** In-memory or disk cache keyed by `(scope, missionId?, agentId?, logicalPath)` with TTL; **invalidate** on explicit operator action or webhook if later added.
- **HEAD / version:** If the SDK exposes a lightweight “version or ETag” call, the plugin may use it to avoid re-downloading large bodies; otherwise full `published` is acceptable for v1.

---

## 9. Coexistence with LiNKskills, PRISM, Zulip

- **LiNKskills:** Tool definitions and retrieval policies may **call LiNKaios** or other services per their own spec; the plugin should **compose** capabilities without merging codepaths into a single unmaintainable module.
- **PRISM-Defender:** Observes signals from the runtime; it does not replace brain HTTP auth.
- **Zulip bridge:** Outbound/inbound messaging is independent of virtual file bytes; shared concerns are **identity** (which agent, which mission) and **secrets** management patterns.

---

## 10. Versioning of this contract

LiNKaios and the SDK should bump **documented** API version or changelog entries when request/response shapes change. The plugin should send a **client identifier header** (optional, e.g. `X-Linktrend-Plugin: <version>`) if the server team wants compatibility metrics.

---

## 11. Acceptance criteria (integration)

- With valid `BOT_BRAIN_API_SECRET` and ids, the plugin can fetch **non-empty** published markdown for a path that exists in LiNKaios for that partition.
- **Retrieve** returns ranked passages for a non-trivial query when embeddings are configured on the server.
- With an invalid secret, the bot **does not** crash; tools degrade and logs show auth failure without leaking the token.
- Mission and agent ids used in brain calls **match** those used in governance payloads for the same workspace package.

This document is the **spec** for how LiNKbrain **links** to the plugin; implementation steps for the plugin repo live in [`linkbrain-plugin-readiness-checklist.md`](./linkbrain-plugin-readiness-checklist.md).
