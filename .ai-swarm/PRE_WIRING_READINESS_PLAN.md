# Pre-Wiring Readiness — Master Execution Plan

**Goal:** Leave LiNKaios `linkaios-web` ready for the **functional wiring sprint** (real create project, Plane bootstrap, live tabs, settings backends, Mission C/D).

**Branch:** All waves commit to **`development`** and push after integrator checkpoint.

**Repo:** `/Users/linktrend/Projects/LiNKtrend-System`  
**Primary code:** `LiNKaios/linkaios-web/`

**When Chairman says `execute pre-wiring readiness`:** Integrator runs waves 0→7 sequentially; parallel subagents within each wave; commit + push `development` after each wave.

---

## Current baseline (known state)

| Area | Status |
|------|--------|
| Suite/project terminology (UI) | Largely done; Wave 5 stragglers remain |
| Add Project wizard | UI good; launch → 404 (no create API) |
| `?tab=cycles` | Fixed → Runs |
| Design system | Partial custom tokens; **shadcn not installed** |
| Lucide icons | Standard |
| Mission backend | C/D not done; UI must not add new "Mission" copy |

**Dirty tree:** `development` may have uncommitted UI/terminology work — Wave 0 integrator reconciles first.

---

## Wave overview

| Wave | Name | Parallel packets | Depends on |
|------|------|------------------|------------|
| **0** | Baseline integrator | 1 (integrator) | — |
| **1** | Design system foundation (shadcn) | 2 | Wave 0 |
| **2** | Project create contract + UX fixes | 2 parallel → 1 sequential | Wave 1 |
| **3** | Stub honesty + terminology + button bridge | 3 | Wave 2 |
| **4** | Shell consistency + settings UX | 2 | Wave 3 |
| **5** | Table migration + UI polish | 2 | Wave 4 |
| **6** | Mission C API surface prep | 1 | Wave 5 |
| **7** | Proof, handoff, wiring sprint brief | 1 (integrator) | Wave 6 |

**Prompt index:** `.ai-swarm/AGENT_PROMPTS/PWR-*.prompt.md`  
**Launch copy-paste:** `.ai-swarm/EXECUTE_PRE_WIRING.md`

---

## Wave 0 — Baseline integrator

**Prompt:** `AGENT_PROMPTS/PWR-W0-integrator-baseline.prompt.md`

**Objective:** Clean commit of existing WIP; establish starting SHA.

**Owner:** Integrator only (no parallel subagents).

**Acceptance:** `development` pushed; typecheck green; `.ai-swarm/AGENT_REPORTS/PWR-W0-baseline.md` filed.

---

## Wave 1 — Design system foundation

**Objective:** shadcn init, semantic theme in `globals.css`, core primitives, single index doc.

| ID | Prompt | Scope |
|----|--------|--------|
| **PWR-W1-A** | `PWR-W1-A-shadcn-init.prompt.md` | shadcn init, `components.json`, `lib/utils.ts`, theme vars, 10+ primitives |
| **PWR-W1-B** | `PWR-W1-B-ui-system-doc.prompt.md` | `docs/ui-system.md`, rule 07 update, SKILLS_CATALOG entry |

**Conflict rule:** W1-A owns `globals.css` and `components/ui/*`. W1-B must not edit those.

**Integrator gate:** typecheck + build → commit → push `development`

---

## Wave 2 — Project create contract

**Objective:** Single create entry point; fix UX that blocks wiring.

### Phase 2a (parallel)

| ID | Prompt | Scope |
|----|--------|--------|
| **PWR-W2-A** | `PWR-W2-A-project-create-api.prompt.md` | `POST /api/projects`, types, demo registry stub |
| **PWR-W2-C** | `PWR-W2-C-project-ux-fixes.prompt.md` | Empty state CTAs, preview suite links, tab URL sync |

### Phase 2b (after 2a on development)

| ID | Prompt | Scope |
|----|--------|--------|
| **PWR-W2-B** | `PWR-W2-B-wizard-wireup.prompt.md` | Wizard → POST, validation, `?created=1` banner |

**Integrator gate:** curl POST + wizard E2E (no 404) → commit → push

---

## Wave 3 — Stub honesty + terminology + button bridge

| ID | Prompt | Scope |
|----|--------|--------|
| **PWR-W3-A** | `PWR-W3-A-stub-honesty.prompt.md` | Settings stub badges, Plane sync honesty, stub API shape |
| **PWR-W3-B** | `PWR-W3-B-terminology-wave5.prompt.md` | Final Mission/Connector/Module string sweep + breadcrumb `/modules` links |
| **PWR-W3-C** | `PWR-W3-C-button-bridge.prompt.md` | BUTTON.* → shadcn Button adapter + one reference migration |

**Integrator gate:** grep terminology gates → commit → push

---

## Wave 4 — Shell consistency + settings UX

| ID | Prompt | Scope |
|----|--------|--------|
| **PWR-W4-A** | `PWR-W4-A-shell-error-venture.prompt.md` | Error/not-found pages, venture detail reskin |
| **PWR-W4-B** | `PWR-W4-B-settings-ux.prompt.md` | User settings dedupe header, Access intro |

**Integrator gate:** commit → push

---

## Wave 5 — Table migration + polish

| ID | Prompt | Scope |
|----|--------|--------|
| **PWR-W5-A** | `PWR-W5-A-entity-table-migration.prompt.md` | 3+ high-traffic EntityTable → DataTable |
| **PWR-W5-B** | `PWR-W5-B-polish.prompt.md` | Empty states, cockpit/metrics copy, minor hierarchy |

**Integrator gate:** commit → push

---

## Wave 6 — Mission C API surface prep

| ID | Prompt | Scope |
|----|--------|--------|
| **PWR-W6-A** | `PWR-W6-A-mission-api-surface.prompt.md` | `projectId` alias in JSON; plane-sync route docs; no DB rename |

**Prohibited:** DB migrations, RPC renames, kernel renames (Mission D).

**Integrator gate:** commit → push

---

## Wave 7 — Integrator proof + wiring handoff

**Prompt:** `PWR-W7-integrator-proof.prompt.md`

**Steps:** typecheck + build, manual flow checklist, handoff doc, final report with all wave SHAs.

---

## Verification gates (every wave + final)

```bash
cd LiNKaios/linkaios-web && npm run typecheck
cd LiNKaios/linkaios-web && npm run build   # Wave 1+ and Wave 7
```

**Forbidden user-facing copy (zero new matches in touched files):**
- `Mission` / `Missions` (except `@deprecated` code symbols)
- `Connectors` as UI label → Capabilities
- Product-level `Modules` where Suite is meant

**Link checks:** No `href="/modules"` in `linkaios-web/src`

---

## Execute command (Chairman)

```
execute pre-wiring readiness
```

Integrator runs Wave 0→7 per `.ai-swarm/EXECUTE_PRE_WIRING.md`.

---

## Wiring sprint checklist (next stage — NOT this plan)

1. `POST /api/projects` → real Supabase insert (+ audit event)
2. Plane bootstrap via `cap.plane.execution_tracking` lease
3. Project tabs live data (modules/phases/issues from bridge)
4. Plane sync real / mock mode flag from capability
5. Settings billing/sessions backends
6. Mission D — DB/RPC rename with migration

---

## Worktree rule (parallel agents)

For 3+ concurrent agents on `linkaios-web`:

```
/Users/linktrend/Projects/LiNKtrend-System/.worktrees/pwr-w<N>-<packet-id>
```

Branch: `dev/pwr-w<N>-<packet-id>` → integrator merges to `development`.

For 2-agent waves with non-overlapping files, integrator may serialize on one checkout.

---

## Report files

| Wave | Report path |
|------|-------------|
| 0 | `.ai-swarm/AGENT_REPORTS/PWR-W0-baseline.md` |
| 1 | `.ai-swarm/AGENT_REPORTS/PWR-W1-A-*.md`, `PWR-W1-B-*.md` |
| 2 | `.ai-swarm/AGENT_REPORTS/PWR-W2-*.md` |
| 3–6 | `.ai-swarm/AGENT_REPORTS/PWR-W3-*.md` … `PWR-W6-*.md` |
| 7 | `.ai-swarm/AGENT_REPORTS/PWR-W7-integrator-proof.md`, `PWR-FINAL.md` |
