# LiNKaios UI System Index

Single entry point for humans and agents building LiNKaios shell UI in `linkaios-web`.

**Authoritative rules:** `.cursor/rules/07-ui-and-frontend-standards.mdc` (detailed patterns).  
**This doc:** where things live, how layers compose, and migration targets.

---

## Layer model

| Layer | Location | Use for |
|-------|----------|---------|
| **Color / theme** | `src/app/globals.css`, `src/app/layout.tsx` | CSS variables, **Inter** sans stack, shadcn semantic tokens |
| **Behavior tokens** | `src/lib/ui-standards.ts`, `src/lib/ui-theme.ts`, `src/lib/status-colors.ts` | Layout, tables, forms, shell chrome, status semantics |
| **Primitives** | `src/components/ui/` | shadcn/ui building blocks (Button, Input, Card, Dialog, …) |
| **Composites** | `src/components/data-table/`, `action-queue/`, `summary-metric-card/`, `forms/` | Opinionated LiNKaios patterns — prefer these over one-off markup |
| **Shell chrome** | `ShellMainFrame`, `ShellPageHeader`, `AutoBreadcrumbs` | Mandatory page frame for `(shell)` routes |

**Default for new UI:** shadcn primitives + `ui-standards` composites. Do not invent parallel button, table, breadcrumb, or page-title classes.

---

## Color source

Semantic colors live in **`src/app/globals.css`** as CSS custom properties on `:root` and `html.dark`.

Current baseline (pre–full shadcn theme):

- `--background`, `--foreground` — page canvas and body text
- Tailwind v4 `@theme inline` maps `--color-background` and `--color-foreground`

After **PWR-W1-A** (shadcn init), `globals.css` also defines shadcn semantic tokens (`--primary`, `--secondary`, `--muted`, `--border`, `--ring`, …) aligned to the existing zinc shell aesthetic. Primitives in `components/ui/` consume those variables — do not hardcode zinc hex values in new components when a token exists.

Dark mode: **`html.dark`** class strategy (not OS `prefers-color-scheme` alone). Match existing pages when adding theme-aware styles.

---

## Primitives — `src/components/ui/`

shadcn/ui components installed via `components.json` (see PWR-W1-A). Import with `@/components/ui/<name>`.

| Primitive | Typical use |
|-----------|-------------|
| `button` | Actions — use variants from migration table below |
| `input`, `textarea`, `label` | Low-level controls inside form composites |
| `select` | Native-style selects when not using `FormSelect` |
| `card` | Section containers, profile panels |
| `dialog` | Modals, confirm flows |
| `tabs` | In-page section switching |
| `badge` | Non-status chips (status indicators use `StatusPill`) |
| `separator`, `skeleton`, `dropdown-menu` | Layout and loading affordances |

**Coexistence:** `status-pill.tsx` and `status-pill-width-provider.tsx` are LiNKaios-specific — keep using them for all status indicators (GLOBAL-001). Do not replace with generic shadcn `Badge`.

**Icons:** **`lucide-react` only.** No inline SVGs, no other icon libraries.

---

## Behavior tokens

### `src/lib/ui-standards.ts`

Central export surface for layout and copy formatters:

| Export | Purpose |
|--------|---------|
| `TYPE` | Five-level type scale — page title, section, subsection, body (`text-sm` default), caption |
| `FIELD`, `FORM` | Form labels, controls, select chevrons, validation spacing |
| `BUTTON` | Legacy button class strings — migrate to shadcn `Button` (see table) |
| `TABLE`, `DATA_TABLE`, `DT` | Columnar table headers and cell classes |
| `SHELL` | Breadcrumb row, page header, subtitle row, actions |
| `TABS`, `BADGE` | Tab strips; legacy fleet chips (prefer `StatusPill`) |
| `SUMMARY_METRIC_CARD` | Dashboard stat tile layout |
| `ACTION_QUEUE` | Feed-style attention row spacing |
| `formatUiLabel`, `formatShellPageTitle`, `formatTableColumnLabel`, `formatCardTitle` | Title Case and LiNK* name preservation |

### `src/lib/ui-theme.ts`

Cross-cutting dimensions and composite badge frames:

- `ATTENTION_QUEUE_BADGE` — fixed-width attention queue type/severity chips
- `WORK_ALERT_BADGE` — inline alert row badges
- Deprecated chips documented inline — prefer `StatusPill`

### `src/lib/status-colors.ts`

Status semantics and pill sizing:

- `StatusTone`, `STATUS_TONE`, `STATUS_PILL`
- `statusPillEqualWidthClass`, `statusPillEqualWidthCh` — equal-width pill groups
- Domain maps for `DomainStatusPill`

Rendered UI: **`StatusPill`** / **`DomainStatusPill`** from `@/components/ui/status-pill`.

---

## Composites

Use these before building inline equivalents. Each has an agent skill and/or module README.

### Data Table — Family A (columnar `<table>`)

- **Path:** `@/components/data-table`
- **Tokens:** `DATA_TABLE`, `DT` in `ui-standards.ts`
- **Skill:** `.cursor/skills/data-table/SKILL.md`
- **README:** `src/components/data-table/README.md`
- **When:** Catalogues, indexes, audit logs, settings lists, any fixed-column HTML table

### Action Queue — Family B (feed rows)

- **Path:** `@/components/action-queue`
- **Tokens:** `ACTION_QUEUE`, accents in `action-queue-accent.ts`
- **Skill:** `.cursor/skills/action-queue/SKILL.md`
- **README:** `src/components/action-queue/README.md`
- **When:** Alerts inbox, work attention feeds — **not** columnar tables

### Summary metric cards

- **Path:** `@/components/summary-metric-card`
- **Tokens:** `SUMMARY_METRIC_CARD` in `ui-standards.ts`
- **Skill:** `.cursor/skills/summary-metric-cards/SKILL.md`
- **When:** Dashboard KPI rows, work stream tiles, lifecycle counts — use preset grids before inventing new stat layouts

### Forms

- **Path:** `@/components/forms`
- **Tokens:** `FORM`, `FIELD` in `ui-standards.ts`
- **Skill:** `.cursor/skills/personal-information-forms/SKILL.md` (PII groups + general form rules)
- **Components:** `FormField`, `FormSelect`, `FormTextInput`, `FormTextarea`, `InsetSelect`, `PersonalNameFields`, `PersonalAddressFields`, `PersonalPhoneFields`
- **When:** Any stacked label + control form; never raw `<select className={FIELD.control}>` (native chevron)

---

## Shell chrome (mandatory)

Every `(shell)` route follows the **Work** page pattern — two rows above content, owned by **`ShellMainFrame`**:

1. **Breadcrumb row** — `SHELL.breadcrumbRow` with **`AutoBreadcrumbs`** + `ShellChromeToolbar`
2. **Page header** — **`ShellPageHeader`** / `ShellPageHeaderClient` via `SHELL.pageHeader`

| Component | Path | Role |
|-----------|------|------|
| `ShellMainFrame` | `@/components/shell-main-frame` | Wraps breadcrumb + auto header + page slot |
| `AutoBreadcrumbs` | `@/components/auto-breadcrumbs` | Path-derived crumbs; Title Case via `formatUiLabel` |
| `ShellPageHeader` | `@/components/shell-page-header` | Title + subtitle + optional actions on subtitle row |
| `ShellPageHeaderClient` | `@/components/shell-page-header` (client export) | Dynamic titles/actions |
| Meta registry | `@/lib/shell-page-meta.ts` | Static titles; `suppressesAutoShellPageHeader()` for custom headers |

Rules:

- **One header per page** — no duplicate `h1` inside page `main`
- Page-level create actions: **`BUTTON.addRow`** (or shadcn `Button variant="add"`) labeled **`Add {Entity}`**
- Settings subpages: header from `SettingsLayoutChrome` — no inline page titles

---

## BUTTON → shadcn Button migration map

Legacy code applies `className={BUTTON.*}`. New code and migrations should use **`Button`** from `@/components/ui/button` with `variant` + `size`. Custom variants below are added during shadcn init (PWR-W1-A) and wired through **`UiButton`** bridge (PWR-W3-C).

| `BUTTON` token | shadcn `variant` | shadcn `size` | Notes |
|----------------|------------------|---------------|-------|
| `primaryRow` | `default` | `default` | Toolbar primary; `min-w-[8.5rem]` |
| `primaryRowUniform` | `default` | `default` | + `min-w-[15.5rem]` for uniform action rows |
| `primaryBlock` | `default` | `default` | + `className="w-full"` |
| `secondaryRow` | `outline` | `default` | Standard secondary |
| `secondaryRowUniform` | `outline` | `default` | + `min-w-[13.5rem]` |
| `secondaryCardAction` | `outline` | `default` | + `self-start` (card footers) |
| `secondaryBlock` | `outline` | `default` | + `w-full` |
| `ghostRow` | `ghost` | `default` | Light bordered ghost |
| `ghostBlock` | `ghost` | `default` | + `w-full` |
| `dangerRow` | `warning` | `default` | Amber caution (not destructive delete) |
| `dangerBlock` | `warning` | `default` | + `w-full` |
| `approveRow` | `approve` | `default` | Filled emerald confirm |
| `rejectRow` | `destructive` | `default` | Outline red dismissal |
| `approveCompact` | `approve` | `sm` | Dense governance rows |
| `rejectCompact` | `destructive` | `sm` | Dense governance rows |
| `primaryCompact` | `default` | `sm` | Table toolbars |
| `secondaryCompact` | `outline` | `sm` | Pairs with `primaryCompact` |
| `editRow` | `edit` | `default` | Sky outline — open editor |
| `approveOutlineRow` | `approve-outline` | `default` | Outlined emerald |
| `rejectOutlineRow` | `destructive-outline` | `default` | Outlined red |
| `addRow` | `add` | `default` | Outlined black — **`Add {Entity}`** in page headers |
| `editTextLink` | `link` | `default` | Text-only edit affordance |
| `editCompact` | `edit` | `sm` | Compact table edit |
| `editTight` | `edit` | `sm` | Fixed `w-[4.125rem]` card header |
| `primaryTight` | `default` | `sm` | Fixed width Save |
| `secondaryTight` | `outline` | `sm` | Fixed width Cancel |
| `ghostTight` | `ghost` | `sm` | Fixed width + Add on cards |

**Migration order:** Wave 3 (`UiButton` bridge) → proof page → Wave 5 mass migration.

**Bridge (PWR-W3-C):** Import `UiButton` from `@/components/ui/button-bridge`. Pass `buttonKey="addRow"` (or any `BUTTON` key) for mapped `variant` + `size`, or keep `className={BUTTON.*}` on `UiButton` during incremental edits. Semantic shadcn names (`variant="approve"`, `variant="add"`, …) resolve through the same map. Proof: projects list empty state (`src/app/(shell)/projects/page.tsx`).

---

## Agent routing

| Task | Read first |
|------|------------|
| Any new LiNKaios UI | This doc + `.cursor/rules/07-ui-and-frontend-standards.mdc` |
| Tables / catalogues | `.cursor/skills/data-table/SKILL.md` |
| Attention feeds / inbox rows | `.cursor/skills/action-queue/SKILL.md` |
| Dashboard stat tiles | `.cursor/skills/summary-metric-cards/SKILL.md` |
| Settings / profile forms | `.cursor/skills/personal-information-forms/SKILL.md` |
| shadcn component API | `components.json` + `@/components/ui/*` after W1-A |
| Visual polish / new pages | `.cursor/skills/frontend-design/SKILL.md` |

---

## Related paths

```
LiNKaios/linkaios-web/
├── docs/ui-system.md          ← you are here
├── components.json            ← shadcn config (PWR-W1-A)
├── src/
│   ├── app/globals.css        ← theme variables (do not duplicate)
│   ├── components/
│   │   ├── ui/                ← shadcn primitives + StatusPill
│   │   ├── data-table/
│   │   ├── action-queue/
│   │   ├── summary-metric-card/
│   │   ├── forms/
│   │   ├── shell-main-frame.tsx
│   │   ├── shell-page-header.tsx
│   │   └── auto-breadcrumbs.tsx
│   └── lib/
│       ├── ui-standards.ts
│       ├── ui-theme.ts
│       └── status-colors.ts
```

**Out of scope for MVO:** rebuilding the design system, pixel-perfect polish, or duplicating Plane/Odoo/n8n UIs in LiNKaios. Functional traceability and operator clarity first.
