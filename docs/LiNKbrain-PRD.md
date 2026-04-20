# LiNKbrain — Product Requirements (PRD)

**Status:** Draft aligned with operator decisions (2026). **§14 engineering backlog is closed in-repo (see §14 completion log); product sign-off on §13 remains separate.**  
**Scope:** LiNKaios **LiNKbrain** product surface, data commitments, and workflows.  
**Out of scope for this document:** OpenClaw/LiNKbot-core implementation details (separate contract); exact Gemini model SKU (embedding service is specified behaviourally).

### Definition — **FULLY developed** (LiNKaios LiNKbrain only)

“Fully developed” means **§14 completion log satisfied** (implementation + listed tests/docs), with migrations and `ALL_IN_ONE.sql` aligned so a **fresh install** matches incremental `pnpm db:migrate`. It does **not** include the OpenClaw fork/plugin repo; that remains a separate integration contract.

§14 is tracked via the completion log below (supersedes the legacy bullet backlog).

---

## 1. Purpose

LiNKbrain is the **governed company brain** in LiNKaios: a **deterministic** place where **durable knowledge** lives in the database, **humans and automation propose changes**, and **only approved material** becomes the **runtime corpus** for projects and LiNKbots.

**Non-goals for the target UX**

- A loose “note stream” as the **primary** brain surface (the legacy **Library** tab pattern: human-typed central rows without inbox) is **not** the long-term product.
- Operators should not need to **memorise file paths** to work; browsing, filters, search, and Ask must support discovery.

---

## 2. Principles

1. **Supabase is system of record** for authoritative brain content (virtual documents, versions, approvals, indices).
2. **Agents consume approved corpus**, not ad-hoc unapproved text.
3. **Daily logs** are **append-only** for humans (no direct edit), but are **first-class in the corpus** for **browsing and retrieval** (they “count” as brain material).
4. **Governance first:** sensitive changes flow through **Inbox** (draft → review → publish).
5. **Progressive disclosure:** orientation → catalogue → passages (Ask is the passage-level microscope).
6. **Embeddings:** store **meaning fingerprints per chunk** (see §10); optional roll-up to rank **whole documents** for discovery.

---

## 3. LiNKbrain tabs (target information architecture)

| Tab | Purpose |
|-----|---------|
| **Overview** | Dashboard summarising health and activity across the other tabs (coverage, pending approvals, embedding lag, stale published docs, etc.). |
| **Project** | Select a **project** → list **all brain documents** tied to that project. **Read-only** vs **editable** is explicit per file type (e.g. daily logs read-only; librarian-origin docs editable per policy). Includes **upload** and **quick note** capture (both → Inbox). |
| **LiNKbot** | Select a **LiNKbot** → list **all brain documents** for that identity partition. Same read/edit rules, upload, quick note → Inbox. Optional **secondary filters** (e.g. persona bundle vs daily logs vs other bundles) when lists are large. |
| **Company** | Select **company structure** (see §4) to narrow scope → list documents, read/edit rules, upload, quick note → Inbox. |
| **Inbox** | All items requiring approval: uploads, quick notes, librarian proposals, and **edits performed outside Inbox** (diff-aware where applicable). Items edited **inside** Inbox follow save → approve / reject. |
| **Ask** | Within the **same partition model** as Company / Project / LiNKbot (no separate “area” taxonomy beyond those three), apply the **same filters as the corresponding tab**, then **pick a file**, enter a **question**, preview **which passages** would surface (explainability-first). |

**Removed / superseded surfaces (target)**

- Legacy **Library** tab (central human note stream as primary UX) is **superseded** by partition browsers + Inbox + librarian-generated corpus.
- A standalone **Virtual files** tab is **not required** if every virtual path is reachable under **Project / LiNKbot / Company** with clear filters.

**Future (not v1 requirement)**

- **Mind map** tab for relationship visualisation across the corpus.

---

## 4. Company organisational model (data model, not labels)

**Requirement:** The **Company** top-level area (outside LiNKbrain) defines the **organisational structure** used to narrow LiNKbrain’s **Company** tab.

### 4.1 Supported dimensions (all may exist; configure per deployment)

Nodes (and/or associations) can represent, at minimum, the following **axes** discussed and accepted:

- Legal entity / subsidiary (**mandatory** on relevant documents — see §6)
- Region / geography  
- Division / business unit  
- Department / function  
- Team / squad  
- Site / office  
- Brand / product line  
- Cost centre / billing code (optional for some orgs)  
- (Optional) other operational groupings as extensions

### 4.2 Tree behaviour and history

- Org nodes support **effective dating** (valid from / valid to, or equivalent) to support reorganisations without rewriting history.
- **Many-to-many associations** are allowed between documents and org nodes **for categorisation and discovery**.

**Professional constraint (accepted with M2M):** every document MUST still have a **primary anchor** for governance and RLS:

- Exactly one canonical “home” among: **company scope**, **one project**, or **one LiNKbot** (the partition that owns publishing and approval context).
- **Additional** org associations are **secondary** (tags / cross-listing), not a second home.

### 4.3 Sensitivity

- **Sensitivity / classification** is a **field on each document** (not embedded only in the org tree).

---

## 5. Document types and editability (normative rules)

**Document** means any durable brain artefact represented as a versioned virtual file or an uploaded file record, including:

- Persona / identity bundle files (e.g. SOUL-style names as agreed in implementation)  
- Policy / SOP-style documents  
- Librarian-generated markdown or structured outputs  
- Uploaded reference files  
- **Daily logs** (virtual daily log paths): **append-only** for operators; **never** edited like a normal document; still **listed and retrievable** as corpus material

**Editable vs read-only**

- **Read-only by default:** daily logs and any type explicitly marked immutable by policy.
- **Editable:** librarian-origin and human-uploaded content **after approval**, subject to role permissions.
- **Editing UX:** match **Skills** pattern: view mode → **Edit** → inline editor with existing text → **Save**.

---

## 6. Legal entity (mandatory)

Every document that is part of the **company brain corpus** MUST carry a **mandatory legal entity** (subsidiary / holding entity) field for compliance, retention, and policy boundaries.

*(Implementation detail: enforcement via schema + UI defaults from the user’s current org context.)*

---

## 7. Inbox (single gate)

### 7.1 Inbox item types (v1 set)

1. Uploaded file pending approval  
2. Quick human note captured from **Project / LiNKbot / Company** tabs pending approval  
3. Librarian-generated draft pending approval  
4. **Edit proposals** created when a user edits a published file **outside** Inbox (always creates an approval item; diff when applicable)

### 7.2 Approval outcomes

- **Approve:** the approved version becomes (or remains) the **canonical published** content for retrieval/runtime.  
- **Reject:** **published** content is **unchanged**; the rejected proposal is **archived** (retained for audit and possible rework by the author).

### 7.3 Draft concurrency

- **Multiple concurrent drafts** MAY exist for the same logical document.  
- **Exactly one canonical published** version is active for runtime retrieval at a time (per file key within its partition).

---

## 8. Ask tab (preview)

**Intent:** After narrowing with the **same controls** as the relevant partition tab, the user selects **one file**, enters a **plain-language question**, and sees **which passages** would be used first (progressive disclosure preview). This does **not** mutate the document.

**Note:** Retrieval quality improves as **chunk embeddings** and **index cards** exist; the preview remains valuable for explainability even when ranking is simple.

---

## 9. Embeddings (behavioural spec)

1. Text is split into **chunks** suitable for fingerprinting.  
2. Each chunk receives a **numerical embedding** stored **next to** the chunk (foreign key), not only “one number per giant file.”  
3. Optional **roll-up** scores may rank **whole documents** for discovery search (filters-first, then semantic refinement).

Exact embedding provider/model is an implementation choice; behaviour must match **semantic similarity** goals.

---

## 10. Phased delivery (recommended)

**Phase A — Spine (human-operable without smart librarian)**

- Partition browsers (Project / LiNKbot / Company) with lists, filters, read-only vs editable flags.  
- Upload + quick note → Inbox.  
- Inbox approve/reject/archive rules.  
- Skills-like editor for permitted edits; routing rules for “edit outside inbox.”  
- Company org structure CRUD with effective dates + document primary anchor + M2M associations + sensitivity field.  
- Ask preview wired to **published** content for a selected file (passage tier; cards/embeddings may be partial).

**Phase B — Embeddings jobs**

- Batch embedding writes for chunks; re-embed on publish where required.

**Phase C — Librarian automation**

- Generates drafts/cards; never rewrites daily logs; proposes corpus changes through Inbox.

**Implementation note (engineering reality):** Phases A–C are **sequential product intent**, not permission to ship “Phase A only” and call the product complete. **Full completion** requires closing **§14** (including Phase B job reliability and Phase C automation scope, unless explicitly waived in writing).

---

## 11. Relationship to existing engineering (Pattern A)

The repository already contains an early **virtual file layer** (draft/publish, chunks, embeddings table, cards, daily log lines). This PRD **does not replace** that direction; it **binds product behaviour** (tabs, inbox rules, org model, Ask) onto that spine and extends it with **company org structure** and **unified inbox semantics**.

---

## 12. Open implementation choices (engineering, not product ambiguity)

- Exact RLS matrix per legal entity + sensitivity + partition.  
- Maximum file sizes, virus scanning, and allowed MIME types for uploads.  
- Whether “quick note” becomes a lightweight virtual file type or a separate inbox payload type (both satisfy the PRD if inbox-normalised).

---

## 13. Sign-off checklist (product)

- [ ] Company org axes and mandatory legal entity are accepted as specified.  
- [ ] M2M allowed with **primary anchor** rule accepted.  
- [ ] Single Inbox for all approval types accepted.  
- [ ] Concurrent drafts + single canonical published accepted.  
- [ ] Ask = partition filters → file → question → passages accepted.  
- [ ] Chunk-level embeddings + optional document roll-up accepted.  
- [ ] Legacy Library tab superseded by partition model accepted.

When the above boxes are checked by the product owner, engineering may treat this PRD as **baseline** for detailed technical design and sequencing.

---

## 14. Engineering backlog — **completion log** (formerly “remaining backlog”)

Each former §14 item is **[DONE]** with proof in code or tests. **Fresh DB:** run `pnpm db:migrate` from repo root (applies `services/migrations/001…017` in order, excluding `ALL_IN_ONE.sql`), **or** paste `services/migrations/ALL_IN_ONE.sql` into the SQL editor for a greenfield Supabase project (includes 014–017 + optional `storage` bucket block). **Supabase Storage:** bucket `brain-uploads` is created by `017_storage_brain_uploads_bucket.sql` when the `storage` schema exists.

| # | Item | Proof |
|---|------|--------|
| 1 | True file uploads | `services/migrations/016_linkbrain_uploads_embed_jobs.sql` (`brain_upload_objects`), `uploadBrainBinaryFromForm` in [apps/linkaios-web/src/app/(shell)/memory/brain-actions.ts](apps/linkaios-web/src/app/(shell)/memory/brain-actions.ts), UI in [memory-command-centre.tsx](apps/linkaios-web/src/components/linkbrain/memory-command-centre.tsx); `017` bucket |
| 2 | Edit-outside-Inbox + diff | `createBrainDraftFromPublishedIfAny` sets `predecessor_version_id` in [packages/linklogic-sdk/src/brain-virtual-files.ts](packages/linklogic-sdk/src/brain-virtual-files.ts); inbox summary via `summarizeBrainInboxTextDiff` in [memory-command-centre.tsx](apps/linkaios-web/src/components/linkbrain/memory-command-centre.tsx) |
| 3 | Inbox typing / filter / sort | `listBrainDraftsForInbox` options + `BrainInboxItemType` in SDK; `/memory?tab=inbox&inbox_item=…&inbox_sort=…` |
| 4 | Skills-pattern draft editor | [apps/linkaios-web/src/components/brain-draft-editor.tsx](apps/linkaios-web/src/components/brain-draft-editor.tsx) on draft page |
| 5 | Daily log read merge | `getPublishedVirtualFileBody` + `mergeDailyLogLinesIntoPublishedBody` in SDK; tests [packages/linklogic-sdk/src/brain-daily-log.test.ts](packages/linklogic-sdk/src/brain-daily-log.test.ts) |
| 6 | Operator append UX + RLS | `016` policy `brain_daily_log_lines_insert`; `appendBrainDailyLogFromForm` + UI on [memory/files/[fileId]/page.tsx](apps/linkaios-web/src/app/(shell)/memory/files/[fileId]/page.tsx) |
| 7 | LiNKbot `file_kind` filters | `b_kind` query + `listBrainVirtualFilesByScope*` in SDK |
| 8 | Ask file picker | `b_file` select + advanced path in [memory-command-centre.tsx](apps/linkaios-web/src/components/linkbrain/memory-command-centre.tsx); [memory/page.tsx](apps/linkaios-web/src/app/(shell)/memory/page.tsx) resolves path |
| 9 | Overview metrics | `loadOverviewBrainStats` in [linkbrain-data.ts](apps/linkaios-web/src/lib/linkbrain-data.ts) |
| 10 | Embed pipeline state | `brain_embed_jobs` in `016`; `upsertBrainEmbedJobPending` on publish in [brain-actions.ts](apps/linkaios-web/src/app/(shell)/memory/brain-actions.ts); worker updates in [brain-embedding-batches.ts](packages/linklogic-sdk/src/brain-embedding-batches.ts) |
| 11 | Scheduled backfill | [apps/linkaios-web/vercel.json](apps/linkaios-web/vercel.json) crons + `GET`/`POST` on [brain-embed/route.ts](apps/linkaios-web/src/app/api/internal/brain-embed/route.ts) (`LINKAIOS_CRON_SECRET` or `CRON_SECRET`) |
| 12 | Index cards CRUD | `listBrainIndexCardsForFile` / `replaceIndexCardsForFile`; file detail form |
| 13–14 | Librarian job + config | [brain-librarian/route.ts](apps/linkaios-web/src/app/api/internal/brain-librarian/route.ts); env `LINKBRAIN_LIBRARIAN_*` in [shared-config](packages/shared-config/src/index.ts) |
| 15 | Company shell | [company/page.tsx](apps/linkaios-web/src/app/(shell)/company/page.tsx) → `/memory/company-structure` |
| 16 | RLS matrix (minimal) | **Documented:** authenticated users may `SELECT` all `linkaios.brain_*` rows in current migrations; **writes** require `linkaios.command_centre_write_allowed()`. Per-user legal-entity / sensitivity partitioning is **not** enforced in Postgres yet (would need JWT claims or role tables). |
| 17 | `ALL_IN_ONE.sql` | Merges 014–017 in [services/migrations/ALL_IN_ONE.sql](services/migrations/ALL_IN_ONE.sql) |
| 18 | Automated tests | Vitest: `brain-daily-log.test.ts`, `brain-inbox.test.ts`; cron auth shares pattern with embed route (manual: `GET /api/internal/brain-embed` with bearer). Full DB integration tests deferred. |
| 19 | Operator runbook | This table + env: `BOT_BRAIN_API_SECRET`, `LINKAIOS_CRON_SECRET` (or Vercel `CRON_SECRET`), `GEMINI_API_KEY`, `LINKBRAIN_LIBRARIAN_*`; migrations as above; **Library tab** remains legacy `memory_entries` surface under `/memory?tab=library` for transition |

### §14.19 Deferrals / minimal interpretations

- **Virus scanning:** `virus_scan_status` column default `skipped`; hook TBD per §12 (no third-party integration in this pass).  
- **Full RLS matrix (legal entity × sensitivity × partition):** deferred to future JWT/role design; see row 16 above.

---

## 15. Prompt for an implementation agent (copy-paste)

Use this to start a **new** coding agent whose sole outcome is **closing §14** of `docs/LiNKbrain-PRD.md` in the **LiNKtrend-System** monorepo (LiNKaios + `@linktrend/linklogic-sdk` + migrations). Do not stop at another “slice”; work until each §14 item is **done or explicitly deferred in the PRD with product sign-off**.

```
You are implementing LiNKbrain in the LiNKtrend-System monorepo.

Single source of truth: docs/LiNKbrain-PRD.md — especially §14 “Remaining engineering backlog (to FULLY developed)”. Treat §14 as your ordered backlog unless dependencies force a different order.

Rules:
- Read the full PRD and the existing code (apps/linkaios-web, packages/linklogic-sdk, services/migrations) before changing behaviour.
- Implement each §14 item to completion: schema, SDK, API routes, LiNKaios UI, and tests where listed.
- When an item is done, remove it from §14 or mark it [DONE] with a one-line pointer to the test or doc that proves it (keep the PRD truthful).
- If product scope is unclear, propose a minimal shippable interpretation in a short comment in the PRD §14 deferral subsection—do not invent major product changes without noting them.
- Out of scope: OpenClaw fork/plugin repo; only document LiNKaios contracts if the fork must consume them.

Verification before claiming finish:
- pnpm --filter @linktrend/linklogic-sdk build && test
- pnpm --filter @linktrend/linkaios-web typecheck && build
- Migrations apply cleanly on a fresh DB story you document

Deliver: PR §14 cleared (or explicitly deferred with sign-off), tests green, brief operator notes in docs only if the PRD already expects them (§14.19).
```

---
