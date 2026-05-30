# LiNKtrend Terminology Map

Principal-approved vocabulary (2026-05). Use this document when writing user-facing copy, architecture docs, or navigating repo folders during the terminology migration.

**Related:** `.cursor/rules/07-suite-project-terminology.mdc` (agent enforcement), `docs/architecture/repo-architecture-target.md` (ownership and folder targets).

---

## LiNKaios work hierarchy

| Level | Term | Was (legacy) | Meaning |
|-------|------|--------------|---------|
| 1 | **Suite** | Module (catalogue) | Subscribed product package (LinkSites, LiNKapps, LEXOS, …) |
| 2 | **Module** | Process / project type | Vendor-published recipe inside a suite: phases, issues, assignees (template) |
| 3 | **Project** | Mission | Tenant-created live work: one or more modules, run once or continuous |
| 4 | **Phase** | Workflow (stage group) | Stage group inside a module — ordered work within the module recipe |
| 5 | **Issue** | Issue | Governed task with input/output contracts |
| 6 | **Assignee** | Execution | Who runs the issue: LiNKbot, Automation, or Human |
| 7 | **Run** | Cycle | One pass through project modules (continuous mode); maps to Plane **Cycle** in sync |

**Run once vs continuous:** Once = single end-to-end progress; Continuous = repeated **Runs** (no parallel runs in MVO).

### External system mapping

| LiNKaios | Plane (self-hosted) | Odoo | n8n (LiNKautowork) | Zulip |
|----------|---------------------|------|--------------------|-------|
| Suite | *(none)* | App (do not confuse with LiNKaios Module) | — | — |
| Module | **Module** (work group in project) | — | — | — |
| Project | **Project** | Project (when linked) | — | **Stream** (one stream per LiNKaios project) |
| Phase | Epic or ordered work items under Plane module | — | Internal graph grouping | **Topic** (sub-threads inside project stream) |
| Issue | Work item | Task (when linked) | — | Referenced in topic messages |
| Assignee | Plane user (one service user per LiNKbot role) | — | Automation executor | — |
| Run | **Cycle** | — | Execution (internal) | — |

---

## Integrations: Capability (not Connector in UI)

In LiNKaios, integrations to external software (Plane, Odoo, Zulip, n8n, etc.) are **Capabilities**, governed by LinkSkills leases.

| Context | Term to use |
|---------|-------------|
| LiNKaios UI, docs for operators | **Capability** |
| LinkSkills code paths, repo folders | **capability connector** (internal implementation term) |

Code may reference `capability-connectors/` or connector contracts; user-facing copy says **Capability**.

| Capability (examples) | Software | MVO posture |
|----------------------|----------|-------------|
| `cap.plane.execution_tracking` | Plane (self-hosted) | mock/shadow; live writes future |
| `cap.crm.odoo_shadow` | Odoo CRM | mock/shadow; connector exists |
| `cap.accounting.odoo_shadow` | Odoo Accounting | mock/shadow; connector exists |
| `cap.zulip.run_messaging` | Zulip | governed messaging |
| LiNKautowork / n8n | Automations | executions via capability leases |

---

## LiNKautowork: Automation in UI

| Context | Term to use |
|---------|-------------|
| LiNKaios UI, operator docs | **Automation** |
| LiNKautowork plane, n8n internals, code | **workflow** (deterministic workflow execution) |

Do not call n8n executions “workflows” in LiNKaios UI. **Phase** is reserved for LiNKaios module stage groups only.

---

## LiNKguard (not PRISM in UI)

| Context | Term to use |
|---------|-------------|
| User-facing copy, architecture summaries | **LiNKguard** |
| Legacy code/comments | PRISM Defender may persist until migration completes |

LiNKguard is the worker security and cleanup sidecar. It owns residue cleanup, filesystem policy, runtime guardrails, sidecar heartbeat, and audit hooks.

---

## Repo folder mapping (target state)

| Legacy / current | Target | Notes |
|------------------|--------|-------|
| `modules/` | `suites/` | Tenant-enabled **Suite** packages (LinkSites, LiNKapps, …). Folder rename is planned; docs use `suites/` as target. |
| `plugins/` | absorbed | Vertical/plugin layout retired; content moves into suite packages or owning planes. |
| `LiNKaios/linkaios-web/src/lib/plugins/` | `lib/suite-integrations/` | Suite-specific integration code; rename during LiNKaios migration waves. |
| `LinkSkills/capability-connectors/` | *(unchanged)* | Internal LinkSkills term; UI still says Capability. |

### LiNKaios routes (target)

| Was | Now |
|-----|-----|
| `/modules/…` | `/suites/…` (302 redirects during transition) |
| Nav “Modules” (product catalogue) | **Suites** |
| My Modules | **My Suites** |

---

## Terms that stay distinct

These terms are **not** synonyms. Do not collapse them in docs or UI.

| Term | Meaning | Owned by |
|------|---------|----------|
| **Skill** | Reusable learned/procedural capability governed by LinkSkills | LinkSkills |
| **Tool** | Executable instrument a LiNKbot or automation may invoke under lease | LinkSkills / runtime |
| **Plane Module** | Work group inside a Plane project (maps to LiNKaios **Module**, level 2) | Plane (external) |
| **packages/** | Deployable package entrypoints (thin tooling/deployment shells) | Owning plane |
| **services/** | Runnable service entrypoints where applicable | Owning plane |
| **Capability connector** | LinkSkills implementation of a governed external integration | LinkSkills (internal) |
| **Runtime adapter** | Bridge between LiNKbot and a bot engine (OpenClaw, Agent Zero, …) | LiNKbot |

---

## Forbidden in new user-facing copy

| Do not use | Use instead |
|------------|-------------|
| Mission | **Project** |
| Execution (as hierarchy label) | **Assignee** |
| Workflow (LiNKaios stage groups) | **Phase** |
| Workflow (n8n in UI) | **Automation** |
| Process (vendor templates) | **Module** |
| Module (for LinkSites product) | **Suite** |
| Cycle (LiNKaios UI) | **Run** |
| Connector (LiNKaios UI) | **Capability** |
| PRISM (UI) | **LiNKguard** |

Legacy symbols (`missionId`, `MissionRecord`, `/modules/` routes, `lib/plugins/`) may persist in code until migration phases C/D complete.

---

## Migration tracking (Mission → Project)

| Phase | Scope | Status |
|-------|--------|--------|
| **A** | User-visible copy: Mission → Project | Done |
| **B** | Routes (`/suites/`), breadcrumbs, component names | Done |
| **C** | TypeScript/API aliases (`MissionRecord` → `ProjectRecord`, etc.) | Not done |
| **D** | Database columns, RPC names, webhooks, kernel | Not done |

Do not assume backend migration is complete when reading or writing code.
