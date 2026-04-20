# LiNKskills — Product Requirements (PRD)

**Status:** Draft — aligned with operator decisions (2026-04-15).  
**Scope:** Central **skill library**, **skill metadata (including declared tools)**, **skill lifecycle**, and contracts to LiNKlogic / runtime.  
**Companion document:** `docs/LiNKaios-tool-governance-spec.md` owns org/mission **policy**, **approvals**, **Zulip deep links**, **Projects** and **org settings** UI, and trace **payload** requirements for tool governance events.

**Out of scope for this PRD:** OpenClaw fork internals; exact model routing; implementation of Zulip-Gateway transport (specified at integration boundaries only).

---

## 1. Purpose

LiNKskills is the **central, versioned library of governed execution instructions** (skills) that LiNKbots and operators rely on. Each skill is a **durable product object**: readable body (markdown), **structured metadata**, lifecycle state, and explicit **references to tools** the skill expects the runtime to have available when that skill is used.

**Product outcome:** Operators can **author, review, publish, and deprecate** skills; runtimes can **resolve** the correct approved skill version and **know which tools** the skill declares; the system never silently expands tool access beyond what **LiNKaios policy** (org + mission) allows — enforcement and approval UX live in the companion LiNKaios spec.

---

## 2. Definitions

| Term | Meaning |
|------|---------|
| **Skill** | A row in central storage (`linkaios.skills` or successor) with name, version, body, metadata, status. |
| **Tool** | A row in the **global tool catalog** (`linkaios.tools`). Missions may only bind tools that **exist** here. |
| **Declared tools** | Tool **names** (catalog `name` values) listed in **skill metadata** (structured), not inferred from prose alone. |
| **Org tool policy** | Which catalog tools are permitted at **organization** scope (LiNKaios). |
| **Mission / project tool policy** | Which catalog tools are permitted for a **specific mission** (manifest / mission binding; LiNKaios). |
| **Blocked run** | A run stopped because a skill or execution path requires a tool not allowed by effective policy. |

---

## 3. Principles

1. **Centralization:** Skills are **not** owned as authoritative copies inside worker repos; central store is source of truth for published versions.
2. **Metadata is machine-readable:** **Declared tools** MUST live in **structured skill metadata** (e.g. YAML frontmatter or first-class JSON fields), stable keys, catalog `name` alignment.
3. **Separation of concerns:** LiNKskills defines **what** the skill is and **what tools it declares**; LiNKaios defines **whether** those tools are allowed for org/mission/agent context. This PRD does not duplicate LiNKaios UI requirements — it **depends** on them.
4. **Catalog-only binding:** Mission allowlists reference **only** tools that exist in `linkaios.tools`.
5. **No silent escalation:** If runtime or gateway detects a missing allow, it **stops** and surfaces an **approval** path (LiNKaios + Zulip); see companion spec.
6. **Mission-less runs:** Skills may run **without** a mission (e.g. company-wide CEO agent). Effective tool policy uses **org-level** bindings (and future agent/session rules); see companion spec §5.
7. **Tool versioning for missions:** Missions **float to the latest org-approved** definition for a given tool **name** (no per-mission pin in v1).
8. **Audit:** Skill publish/deprecate and **tool governance** audit expectations for **traces** are defined in the LiNKaios spec (Traces-only operator story).

---

## 4. Information architecture (LiNKaios shell — LiNKskills area)

Target navigation under **LiNKskills** (names may match current app labels):

| Surface | Purpose |
|---------|---------|
| **Skills** | Catalog: list, filter, open detail, edit draft, submit for approval, deprecate per policy. |
| **Tools (global catalog)** | List tools in `linkaios.tools`, create **draft**, edit draft, **delete** only drafts/mistakes, **archive** approved entries per policy, view implementation summary and risk hints. **Org publish/approve** of catalog entries is **org admin** (companion spec). |

**Explicit non-requirement for LiNKskills nav:** Per-mission tool matrices and **pending access requests** live under **LiNKaios → Projects** and **org settings** (companion spec), not duplicated as a second source of truth under LiNKskills.

---

## 5. Skill record — functional requirements

### 5.1 Fields and metadata

- **Identity:** `name`, monotonically increasing `version` (or equivalent), `status`.
- **Lifecycle:** `draft` → `approved` → `deprecated` (align with existing schema or extend with explicit `rejected` only if needed for **skill** review, not tool requests).
- **Body:** Markdown instruction text (SKILL.md-style: optional YAML frontmatter + body).
- **Structured metadata (required keys for v1):**
  - `declared_tools: string[]` — each entry MUST match `linkaios.tools.name` for tools the skill expects (may be empty).
  - Human-facing: title/description/category/published flags as already used by LiNKskills admin patterns.

### 5.2 Validation

- On **save** (draft): warn if `declared_tools` contains names **not** in catalog (hard error if product chooses zero-tolerance; default recommendation: **hard error** once catalog is non-empty for those names).
- On **approve** skill: **hard error** if any `declared_tools` entry is missing from catalog or not **org-approved** for use (exact rule in companion spec).

### 5.3 Resolution

- Runtime/SDK resolves **latest `approved`** skill by `name` (existing pattern) unless product later adds explicit version pins for skills (out of v1 unless already present).

---

## 6. Tool catalog (LiNKskills product slice)

### 6.1 Registry

- Single global table `linkaios.tools` remains the **catalog of record**.
- Tool **lifecycle:** `draft` | `approved` | `archived` (existing).
- **Delete:** allowed **only** for tools that have **never** been `approved` (draft/mistake cleanup only). **Never** delete a once-approved tool row; use **archive**.

### 6.2 LiNKskills · Tools UI

- CRUD consistent with §6.1 and RLS (`command_centre_write_allowed` patterns).
- Display linkage: which **approved** skills **declare** each tool (read-only aggregate for operators).

---

## 7. Runtime and SDK contracts (requirements on shared packages)

These are **product requirements** on `linklogic-sdk`, `bot-runtime`, and types — implementation may evolve if behavior matches intent.

1. **Governance payload** includes effective **allowed tool names** after **intersection** of: org policy, mission policy (if mission present), and any agent/session overlay defined in companion spec.
2. **Declared tools** from the active skill are **exposed** in payload or side-channel for **workers/gateway** to validate **before** invoking a tool not on the effective list.
3. **Fail-closed:** If validation cannot be performed (missing data, deny flag), run does not proceed with expanded tools.
4. **Blocked run signal:** Structured event / HTTP response / message envelope that LiNKaios and Zulip-Gateway can turn into a **deep link** + trace row (companion spec).

---

## 8. Dependencies on LiNKaios (must ship with or before LiNKskills “complete”)

The LiNKskills product is **not** fully usable without:

- Org-level and mission-level **tool allowlists** and approval matrix (companion spec §3–6).
- **Projects → Tools** tab: list, add (from catalog), pending requests, **reject** (requests only), lifecycle for **bindings** distinct from catalog **archive**.
- **Blocked run** → **no retry until LiNKaios approval**; Zulip **one-shot approve** deep link.
- **Traces** populated with tool-policy and approval events per companion spec.

---

## 9. Acceptance criteria (LiNKskills scope only)

1. Operator can create/edit a skill with **declared_tools** in metadata; invalid names are blocked per §5.2.
2. Operator can manage **draft** tools in catalog; cannot delete **approved** tools; can archive approved tools.
3. Skill catalog and tool catalog remain **inspectable** under LiNKskills with correct RLS for command-centre roles.
4. SDK/runtime consumes **declared_tools** + **effective allowlist** per §7 (verified by integration tests or smoke scripts as project standards require).

---

## 10. Open items (product, not blockers for drafting)

- Exact **YAML schema** vs DB-only metadata columns (implementation choice; behavior in §5 is binding).
- Whether **skill approval** requires declared tools to be **org-approved** only vs also **mission-approved** (default: **org-approved** for catalog; mission binding is separate at run time).

---

## 11. Document control

| Version | Date | Notes |
|---------|------|--------|
| 0.1 | 2026-04-15 | Initial PRD from operator Q&A and repo reality. |
