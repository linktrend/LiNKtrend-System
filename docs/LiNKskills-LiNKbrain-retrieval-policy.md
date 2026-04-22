# LiNKskills + LiNKbrain retrieval policy (builder)

This note matches shipped behavior in `linklogic-sdk`, migrations, and LiNKaios APIs.

## LiNKskills — progressive disclosure

1. **Layer 1 — Discovery:** `GET /api/skills/discovery?layer=1` (authenticated) returns skill categories plus counts. Category intro text may live in `linkaios.skill_categories.intro_text`.
2. **Layer 2 — Slim list:** `GET /api/skills/discovery?layer=2&categoryId=<uuid>` returns skills **without** `body_markdown` (slim columns + `metadata.linkaios_index` only).
3. **Semantic discovery (optional):** `GET /api/skills/discovery?layer=semantic&q=<text>&limit=<1-50>` (authenticated) ranks slim skills by cosine similarity against `linkaios.skill_slim_embeddings`. Requires **`GEMINI_API_KEY`** on the LiNKaios server; returns `{ layer: "semantic", results: [{ skill, score }] }` (503 if the key is missing). Up to ~2000 embedding rows are scanned per request (SDK default); tune `limit` for UI snippets.
4. **Layer 3 — Execution:** `POST /api/skills/execution` with `Authorization: Bearer <BOT_SKILLS_API_SECRET>` or `BOT_BRAIN_API_SECRET` returns the full execution package (body, `skill_scripts`, `skill_references`, `skill_assets`, `effective_declared_tools`, and **`resolved_steps`** for stepped skills — see below).

**`step_recipe` JSON (stepped skills)** — each element is an object with:

| Field | Meaning |
|-------|---------|
| `ordinal` | Required. Integer step order (1-based in the editor). |
| `title` | Optional human label. |
| `model` | Optional model override; if omitted, `skills.default_model` applies. |
| `declared_tools` | Optional string array; merged with **skill-wide** defaults for that step’s `effective_declared_tools` in `resolved_steps` and for governance union. |
| `script_ids` | Optional UUID strings referencing `skill_scripts.id` for this skill. **Omitted or empty ⇒ all skill scripts** apply to the step in `resolved_steps`. Any non-empty list **restricts** the step to those scripts only. |
| `reference_ids` | Optional UUID strings referencing `skill_references.id`. Always unioned with reference rows whose `step_ordinal` equals `ordinal`, plus all rows with `step_ordinal IS NULL` (skill-wide). Legacy alias: `reference_pointers` (same shape as `reference_ids`). |
| `asset_ids` | Optional UUID strings for `skill_assets.id`, merged the same way as references. |

**Approval:** `validateEffectiveDeclaredToolsNonEmpty` + `getDeclaredToolsFromSkill` enforce a **non-empty effective declared-tool union** before draft→approved; each name must pass `validateDeclaredToolsForSkillApprove` (catalog + org allowlist).

**Source of truth**

- **Simple skills:** `default_declared_tools` (Postgres `text[]`), `default_model`, `skill_scripts`, `skill_references`, `skill_assets`, optional `step_recipe` stays empty.
- **Stepped skills:** `step_recipe` JSON holds per-step overrides; skill-wide defaults still apply when a step omits a field.
- **Declared tools (governance):** for `skill_mode = stepped`, effective declared tool names are the **union** of `default_declared_tools` (and metadata fallback) with every step’s non-empty `declared_tools` array in `step_recipe`. That union is what `getDeclaredToolsFromSkill` feeds into governance; it is still **intersected** with org/mission policy in `buildLinktrendGovernancePayload`, so it never widens past policy.
- **References & assets:** first-class rows in `linkaios.skill_references` and `linkaios.skill_assets` (each row has a stable `id`, human **`label`** / **`name`**, machine **`target`** / **`storage_uri`**, and optional **`step_ordinal`**). **`step_ordinal` is `NULL` = skill-wide** (applies to the whole skill). **`step_ordinal` = N** scopes the pointer to the step whose `ordinal` in `step_recipe` matches **N** (1-based convention in the editor). The LiNKskills workspace writes these tables; legacy metadata keys were migrated and stripped in migration `022`.
- **`metadata.linkaios_index`:** Derived on save (server); do not hand-edit. It mirrors routing labels for operators and embeddings.

**Embeddings:** `POST /api/internal/skill-embed` (cron secret + `GEMINI_API_KEY`) fills `linkaios.skill_slim_embeddings` asynchronously.

## LiNKbrain — stages

`POST /api/brain/retrieve` accepts optional `stage`. If **`stage` is omitted**, the handler defaults to **`index_cards`** (cards only, no chunk bodies) so bots do not accidentally pull full passages. **`runBrainRetrievalSandbox`** defaults the same way when `stage` is not passed. **`retrieveBrainContextForPath`** in `linklogic-sdk` uses the same default when **`params.stage`** is omitted. The LiNKbrain **Ask** UI passes **`b_stage`**; when `b_stage` is absent it defaults to **`chunks`** if a question (`b_query`) is present, otherwise **`index_cards`**.

| `stage`       | Behavior |
|---------------|----------|
| `orientation` | Index cards for the requested path only; **no** chunk bodies; optional `mapIndexCards` from company path `linkbrain/orientation/how-to-find-things`. |
| `index_cards` | Cards only, no chunks. |
| `chunks` / `full` | Cards + top‑K chunk text; **no** large published-body dump when structured chunks exist. |

Semantic ranking uses Gemini embeddings when `GEMINI_API_KEY` is set; otherwise chunks are taken in document order.

## Governance payload (runtime)

`buildLinktrendGovernancePayload` returns **slim** skill context (no `body_markdown`, no script blobs). **`bot-runtime`** (and other workers) should call **`POST /api/skills/execution`** on LiNKaios using **`LINKTREND_PUBLIC_BASE_URL`** plus **`BOT_SKILLS_API_SECRET` or `BOT_BRAIN_API_SECRET`** when they need full instructions, scripts, and reference/asset rows — not by re-expanding governance alone. Traces: `bot_runtime.skill_execution_ok` / `bot_runtime.skill_execution_error` summarize the Layer 3 fetch outcome.
