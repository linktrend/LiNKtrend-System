# Agent prompt — LiNKskills: org allowlist on skill approve (pre-launch)

Paste everything below the line into a **new Agent** chat. Repository root: **`LiNKtrend-System`**.

---

## Goal

Remove the **catalog-only “published + approved” proxy** for **skill approve** and enforce **`linkaios.org_tool_allowlist`** instead: a draft skill may only be approved if **every** name in `metadata.declared_tools` exists in the catalog **and** appears in the **org allowlist** (non-archived tool rows). Remove **`TODO(LiNKaios-tool-governance)`** comments that are satisfied by this work.

**Out of scope:** Mission tool bindings, Zulip, governance-payload runtime intersection (already separate), UI changes beyond clearer error text if helpful.

## Preconditions

Read:

- `packages/linklogic-sdk/src/declared-tools.ts` — `validateDeclaredToolsForSkillApprove`, `isToolPublishedApprovedCatalog`
- `packages/linklogic-sdk/src/tool-governance-db.ts` — `loadOrgAllowedToolNames` (logic today uses service client type)
- `apps/linkaios-web/src/app/(shell)/skills/actions.ts` — `approveSkill`
- `services/migrations/018_linkaios_tool_governance.sql` — `org_tool_allowlist` + RLS (`authenticated` SELECT)

## Requirements

1. **Loader for LiNKaios web:** Expose a way for **server actions** to load org-allowed tool **names** using the same query logic as `loadOrgAllowedToolNames` in `tool-governance-db.ts`. Prefer **exporting** a function from `@linktrend/linklogic-sdk` that accepts the **Supabase client** used in `skills/actions` ( loosen the parameter type from service-only to the shared `SupabaseClient` / schema-capable client your repo uses — avoid `any`).

2. **`validateDeclaredToolsForSkillApprove`:** Extend signature (or replace with a small pipeline) so approval validation is:
   - **Catalog:** every declared name exists in `toolsByName` map (keep current behavior).
   - **Catalog row quality:** keep **`isToolPublishedApprovedCatalog`** (or equivalent: `status === 'approved'` + published admin flags) so drafts / unpublished tools cannot be “approved through” via org list alone.
   - **Org allowlist:** every declared name must be in the **set of names** returned from `org_tool_allowlist` ∩ `tools` (same semantics as `loadOrgAllowedToolNames`: exclude **archived** tools).

3. **Empty org allowlist:** Org policy is **deny-by-default**. If `loadOrgAllowedToolNames` returns **no** names and the skill has **one or more** declared tools after normalization, **reject** approve with a clear operator-facing message (e.g. point to **Settings → Tools** to add tools to the org allowlist). If declared tools are **empty**, approve validation for org must **not** block.

4. **`approveSkill`:** After `toolsByNameMap`, load org-allowed names via the exported SDK helper, then call the updated validator. Do **not** duplicate SQL in the web app.

5. **Comments / docs:** Update the comment above `approveSkill` and any stale “until LiNKaios” wording in `declared-tools.ts`. Remove obsolete TODO lines tied to org tables.

6. **Tests:** Update `packages/linklogic-sdk/src/declared-tools.test.ts` (and add cases if needed) so `validateDeclaredToolsForSkillApprove` is covered with an explicit **`orgAllowedNames`** set / empty-set behavior.

## Verification (must run and report)

```bash
pnpm --filter @linktrend/shared-types build
pnpm --filter @linktrend/linklogic-sdk build
pnpm --filter @linktrend/linklogic-sdk test
pnpm --filter @linktrend/linkaios-web exec tsc --noEmit
```

Optionally `pnpm --filter @linktrend/linkaios-web lint` if touched files are linted.

## Acceptance

- [ ] Approving a skill whose `declared_tools` includes a tool **not** on `org_tool_allowlist` fails with a clear error.
- [ ] Approving a skill with **no** declared tools still works when catalog/org rules are otherwise satisfied.
- [ ] No remaining `TODO(LiNKaios-tool-governance)` in the approve path for org allowlist.
- [ ] All commands above green.

---

**Start by** listing the exact function signatures you will change, then implement.
