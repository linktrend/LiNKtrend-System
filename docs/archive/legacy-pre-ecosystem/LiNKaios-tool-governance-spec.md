# LiNKaios — Tool governance & approvals (spec)

**Status:** Draft — companion to `docs/LiNKskills-PRD.md` (2026-04-15).  
**Purpose:** Specify everything LiNKaios must implement so **org + mission tool policy**, **approval workflows**, **Zulip deep links**, and **Traces** satisfy the LiNKskills / runtime model. LiNKskills PRD owns the skill library and **declared_tools** metadata; **this document owns policy surfaces and operator workflows.**

---

## 1. Goals

1. Operators can **see and edit** which tools the **organization** allows.
2. Operators can **see and edit** which tools each **project (mission)** allows, **only** from entries in `linkaios.tools`.
3. When a run is **blocked** because a required tool is not allowed, the system **does not auto-retry** after approval; operators **approve in LiNKaios**, then a new run may proceed.
4. **Zulip** carries a **one-shot approval deep link** (LiNKtrend comms channel is Zulip, not Slack).
5. **Audit:** Operators reconstruct policy and approval history from **Traces** (no separate mandatory audit UI in v1).

---

## 2. Roles (binding)

| Role | Capability |
|------|------------|
| **Org admin** | Approve/register/publish tools at **org** level in the global catalog sense; manage **org-wide allowlist**; participate in **project** tool approvals as specified below. |
| **Project head** | Approve **mission/project** tool allowlist changes (bindings), per policy. |

**Project / mission tool binding:** Per operator decision, **both org admin and project head** must approve **project-level** tool allowlist changes (implementation: sequential approvals, dual gate on one ticket, or two electronic signatures — product picks one pattern; behavior is **both** must be satisfied before binding is active).

**Clarification:** **Reject** applies only to **pending allowlist / access requests**, not to approved catalog rows (those use **archive** on the catalog).

---

## 3. Data model direction (Supabase)

Exact migration names are implementation details; **required concepts:**

### 3.1 Org-level tool policy

- **Org tool allowlist:** set of `tool_id` (or catalog `name` with FK to `linkaios.tools`) **approved for use somewhere in the org**.
- Optional: **default org allowlist** used when **no mission** is attached (mission-less runs).

### 3.2 Mission-level tool policy

- **Mission tool allowlist:** subset (or intersection) with org policy; stored authoritatively in a way that `linklogic-sdk` / governance builder can read (today: `linkaios.manifests.payload` keys such as `approvedTools` — may remain if extended with versioning and request workflow).

### 3.3 Pending requests (access / allowlist)

- Table or workflow state for **tool access requests**: who requested, which mission (nullable for org-wide), which tool, status `pending | approved | rejected`, timestamps, approver ids for each required role, correlation id for trace linkage.
- **Reject** only on these pending rows.
- **Approve** transitions must write **Traces** (see §8).

### 3.4 Catalog lifecycle (LiNKaios side)

- Global `linkaios.tools`: **archive** for retired tools; **delete** only if never approved (draft cleanup). Aligns with LiNKskills PRD §6.

---

## 4. UI — Organization settings

**New or extended area:** **Org settings → Tools** (or equivalent).

| Feature | Description |
|---------|-------------|
| **Org allowlist** | View all catalog tools; mark which are **org-allowed** (or deny-by-default with explicit allow). |
| **Catalog gate** | New tool entries start as **draft**; **org admin** promotes to org-visible / org-allowed per PRD. |
| **Mission-less default** | Configure **effective tools** when `mission_id` is absent (CEO / company-wide agents): at minimum **intersection** of org allowlist + any agent-class defaults defined later. |

---

## 5. UI — Projects (missions)

**Extend:** `ProjectDetailTabNav` (or successor) with a **Tools** tab.

**Tools tab contents:**

| Feature | Description |
|---------|-------------|
| **Allowed tools list** | Tools currently on the **mission allowlist** (resolved from manifest or normalized table). |
| **Add tool** | Picker **only** from `linkaios.tools` rows that are **org-allowed** and not **archived**; creates **pending binding** until approvals satisfied (§2). |
| **Remove binding** | Remove tool from mission allowlist per policy (may require same dual approval if high-risk — v1 can require dual for any removal/add). |
| **Pending** | Queue of **pending** mission tool requests with **Approve** / **Reject** actions for authorized roles. |
| **Reject** | Sets request to rejected; **no** effect on catalog **archive** state. |

**Deep link target:** each pending request has a stable URL under LiNKaios (e.g. `/missions/{id}/tools?request={uuid}`) for Zulip messages.

---

## 6. Blocked run → approval → retry

### 6.1 Behavior

1. Worker/runtime/gateway detects tool invocation or skill **declared_tools** not covered by **effective allowlist** (org ∩ mission ∩ agent rules).
2. Run **stops**; returns or emits a **blocked** outcome with: `trace_correlation_id`, `mission_id` (nullable), `tool_name`, `skill_name`/`skill_version`, `request_type` (e.g. `mission_binding` vs `org_binding`).
3. System creates or updates a **pending request** row if one does not exist for that correlation.
4. **No automatic retry** after approval; operator starts or approves then **explicitly** re-runs.

### 6.2 Zulip

- **Zulip-Gateway** (or LiNKaios notification worker) posts a message to the appropriate stream/topic with:
  - Short human summary (tool, mission or “org-wide”, skill).
  - **One-shot deep link** to LiNKaios approval screen (§5).
- Integration must respect existing **stream → mission** routing (`gateway.stream_routing`); for org-wide blocks, routing rules in `docs/zulip-routing.md` may need extension (e.g. fallback stream or DMs to org admins — **implementation choice**, behavior: message must reach someone who can approve).

### 6.3 LiNKaios approval page

- Shows request context, skill declared tool, current allowlists.
- **Approve** only if acting user satisfies pending approval rules; when **dual** approval required, second approver completes the transition.
- On final approval: update mission allowlist (or org list), emit **Trace**, clear pending; user sees **“Re-run worker”** guidance (link to worker/session docs optional).

---

## 7. LiNKlogic / governance payload (requirements)

- `buildLinktrendGovernancePayload` (and successors) MUST compute **effective** `approvedTools.toolNames` as:
  - **Intersection** of org allowlist, mission allowlist (if mission present), and declared constraints.
  - If **no mission:** use **org default** for mission-less runs (§4) and still intersect with skill-declared tools if the skill is loaded (fail-closed if empty).
- Manifest payload keys may remain backward compatible (`approvedTools`, etc.) but **authoritative** lists may move to normalized tables if migrations add them — SDK must read **one** source of truth after migration.

---

## 8. Traces (audit — only operator surface)

Every **significant** tool governance event MUST emit a trace row (existing `linkaios.traces` or gateway traces pattern) with structured `metadata` including at minimum:

- `event_type`: e.g. `tool.request.created`, `tool.request.approved`, `tool.request.rejected`, `tool.binding.added`, `tool.binding.removed`, `tool.run.blocked`, `tool.catalog.archived`, `tool.catalog.draft_deleted`.
- `tool_name`, `tool_id` if applicable.
- `mission_id` (nullable).
- `skill_name`, `skill_version` when relevant.
- `actor_user_id` (or service principal).
- `correlation_id` linking to worker session / blocked response.

**No separate audit grid** is required in v1 if Traces UI can **filter** by `event_type` prefix `tool.` (add filters if missing).

---

## 9. Non-functional

- **RLS:** All new tables follow `linkaios` RLS patterns; writes gated by `command_centre_write_allowed()` and role refinements as needed for **project head** vs **org admin** (may require new helper or claims).
- **Performance:** Allowlist reads are cached in SDK per session where already idiomatic; must not add N+1 catalog fetches per tool call.

---

## 10. Out of scope (v1)

- Slack or email notifications.
- Per-mission **pin** of tool implementation version (missions use **latest approved** catalog row for that name).
- Automated promotion of skills to production without human approve.

---

## 11. Implementation checklist (for agents / humans)

- [ ] Migrations: org policy, mission bindings (or manifest sync), pending requests.
- [ ] RLS + role claims for org admin vs project head.
- [ ] LiNKaios web: Org settings → Tools; Project → Tools tab; pending queue; approval page with deep link route.
- [ ] SDK: effective allowlist + blocked-run structure.
- [ ] Zulip-Gateway: deep link message on block / on new request (configurable templates).
- [ ] Traces: emit events in §8; document query examples in operator docs (optional small `docs/` snippet).

---

## 12. Document control

| Version | Date | Notes |
|---------|------|--------|
| 0.1 | 2026-04-15 | Initial spec from operator Q&A. |
