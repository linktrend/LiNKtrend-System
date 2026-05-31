# UI Authority — LiNKaios vs LinkSites vs Shared Packages

**Status:** Canonical grounding (May 2026)  
**Audience:** Agents building or reviewing UI in the MVO four-repo workspace  
**Workspace policy:** `/Users/linktrend/Projects/Workspaces/MVO-UI-POLICY.md`

This document is the **product-level authority** for which UI system governs which surface. It does not replace detailed pattern docs — it routes agents to them.

---

## Authority stack (LiNKaios operator UI)

Read in this order when changing **LiNKaios Client or Admin** UI in `linkaios-web`:

| Priority | Document | Path |
|----------|----------|------|
| 1 | UI system index (layers, paths, migration) | `LiNKaios/linkaios-web/docs/ui-system.md` |
| 2 | Cursor product rule (mandatory patterns) | `.cursor/rules/08-linkaios-ui-standards.mdc` |
| 3 | Behavior tokens (single import surface) | `LiNKaios/linkaios-web/src/lib/ui-standards.ts` |
| 4 | Host agent skills (composite families) | `LiNKdev/skills/host/` — see below |

**Primitives:** shadcn/ui at `@/components/ui/*` (configured in `linkaios-web/components.json`).

**Composites (prefer over one-off markup):**

| Family | Components | Skill |
|--------|------------|-------|
| Data Table (A) | `@/components/data-table` | `LiNKdev/skills/host/data-table/SKILL.md` |
| Action Queue (B) | `@/components/action-queue` | `LiNKdev/skills/host/action-queue/SKILL.md` |
| Summary metric cards | `@/components/summary-metric-card` | `LiNKdev/skills/host/summary-metric-cards/SKILL.md` |
| Forms / PII | `@/components/forms` | `LiNKdev/skills/host/personal-information-forms/SKILL.md` |

Module READMEs live beside each composite under `linkaios-web/src/components/*/README.md`.

---

## Hard rules (LiNKaios)

1. **Use existing shell and tokens** — do not hand-roll parallel buttons, tables, breadcrumbs, or page titles.
2. **One header per `(shell)` page** — `ShellMainFrame` + `ShellPageHeader`; register custom headers in `shell-page-meta.ts`.
3. **Title Case** for labels and column headers via `formatUiLabel`, `formatTableColumnLabel`, `TABLE_COLUMN.*`.
4. **Status indicators** — `StatusPill` / `DomainStatusPill` only (GLOBAL-001).
5. **MVO bar** — functional traceability and operator clarity; not a design-system rebuild.

---

## LinkSites customer UI — different authority

**Rule:** LinkSites templates use the **`packages/ui` vendor model**, not the LiNKaios full shell.

| Aspect | LinkSites (Class B) | LiNKaios (Class A) |
|--------|---------------------|---------------------|
| Shell | Template layout only | `ShellMainFrame`, breadcrumbs, page header |
| Shared UI | Copy/vendor from `LiNKsites/packages/ui` | `@/components/ui` + composites in `linkaios-web` |
| Runtime import | Templates are self-contained after vendoring | Monorepo imports within `linkaios-web` |
| Audience | Public SMB site visitors | Operators, Principal, vendor staff |

Authoritative vendor readme: `LiNKsites/packages/ui/README.md` — *"No project should import from this folder at runtime."*

Agents working in **LiNKsites** must not port LiNKaios data-table, action-queue, or shell chrome to customer templates unless explicitly assigned and adapted for marketing UX.

---

## Upstream UIs — out of scope

Plane, Odoo, n8n, Zulip, and Payload admin are **kitchen systems**. LiNKaios provides traces, capability leases, and deep links — not feature parity UI. See `MVO-UI-POLICY.md` Class C table.

---

## Shared `@linktrend/ui` package (System monorepo)

Early shared primitives: `LiNKtrend-System/packages/ui` (`@linktrend/ui`).

- Used where LiNKaios-adjacent surfaces need cross-app primitives.
- **Not** a substitute for LinkSites template vendoring.
- Extraction/consolidation plan: `LiNKdev/product/grounding/UI_PACKAGE_EXTRACTION.md` (future work — no implementation in MVO scope).

Optional reference surfaces mentioned in rules: `LiNKapps/packages/ui` / `@starter/ui` for non–linkaios-web patterns when appropriate — do not expand scope without issue assignment.

---

## Agent routing summary

| Surface | Governing docs |
|---------|----------------|
| LiNKaios shell pages | This file → `ui-system.md` → `08-linkaios-ui-standards.mdc` → `ui-standards.ts` → host skill |
| LinkSites public template | `LiNKsites/docs/README.md`, `packages/ui/README.md`, template app code |
| LiNKbot channels / gateway UI | `LiNKbot-core/AGENTS.md` + scoped subtree |
| Automation / n8n | LiNKautowork — no LiNKaios shell |

When unsure which class applies, read `MVO-UI-POLICY.md` before writing UI code.
