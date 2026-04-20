# Agent prompt — Execute `docs/LiNKaios-tool-governance-spec.md` only

Paste the block below into a **separate Agent chat** (implementation mode). Repo root: **`LiNKtrend-System`**.

---

## Single source of truth

Read and follow **`docs/LiNKaios-tool-governance-spec.md`** end-to-end. Do **not** implement LiNKskills catalog authoring for `declared_tools` or SKILL.md editor UX — that is **`docs/LiNKskills-PRD.md`** (another agent). Assume skills may expose `declared_tools` in metadata or governance payload once the other track lands; until then, use **manifest allowlists** and existing skill resolution without breaking builds.

## Scope you own

1. **Supabase migrations:** Org tool allowlist, mission tool bindings (or normalized sync with `linkaios.manifests.payload`), **pending tool access requests** with `pending | approved | rejected`, dual-approval fields for **org admin + project head** per spec §2–3. Update **`services/migrations/ALL_IN_ONE.sql`** tail to match incremental migrations.
2. **RLS:** Policies consistent with `command_centre_write_allowed()`; extend with role helpers for org admin vs project head as needed (see `docs/operator-roles.md` if present).
3. **`linklogic-sdk`:** Compute **effective** `approvedTools.toolNames` as **intersection** of org allowlist, mission allowlist (if mission present), and mission-less org default per spec §7; **fail-closed** when data missing; structured **blocked-run** outcome with ids for traces and deep links (spec §6).
4. **`bot-runtime` / gateway:** Wire blocked outcome without silent retry; pass correlation ids for traces.
5. **LiNKaios web:** **Org settings → Tools** (spec §4); **Projects → Tools** tab extending `apps/linkaios-web/src/components/project-detail-tab-nav.tsx` and `missions/[id]` routes; pending queue; approve/reject; stable deep link `?request=` (spec §5–6).
6. **Zulip:** `apps/zulip-gateway` (or agreed notifier): post message with **one-shot LiNKaios URL** on block/request; respect `docs/zulip-routing.md` and `gateway.stream_routing`; define fallback for mission-less (spec §6.2).
7. **Traces:** Emit rows for every event type in spec §8 with required metadata; add Traces UI filter for `tool.*` if missing and cheap.

## Explicitly out of scope

- Skill markdown editor and `declared_tools` authoring UI (other agent).
- Changing OpenClaw fork.

## Coordination with LiNKskills track

If governance payload needs a field **`declaredTools`** (or similar) from the resolved skill, add SDK support that **defaults to empty array** when metadata lacks the key, so either agent can merge first.

## Verification

`pnpm` lint/typecheck/build for touched packages. Smoke: pending request → dual approval → manifest/allowlist updated → governance payload includes tool; reject path leaves catalog unchanged.

## Deliverable

PR with migration filenames, new routes, env vars for LiNKaios base URL in Zulip templates, and any contract the LiNKskills agent must satisfy.

---

**Start by** quoting spec §2 and §8 in plain language, then a file-level task list, then implement.
