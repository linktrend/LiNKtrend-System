# UI Package Extraction Plan — `@linktrend/ui`

**Status:** Future work stub — **not MVO implementation**  
**Created:** May 2026  
**Authority:** `UI_AUTHORITY.md`

One-page plan for extracting and consolidating shared UI into a publishable `@linktrend/ui` package. No code changes are authorized by this document alone.

---

## Problem

Today UI knowledge splits across:

- **LiNKaios shell** — rich composites (`data-table`, `action-queue`, `summary-metric-card`, forms) + `ui-standards.ts` in `linkaios-web`
- **System monorepo** — minimal `@linktrend/ui` at `packages/ui`
- **LinkSites** — vendor-only `packages/ui` copied into templates (no runtime import)

Agents confuse Class A operator patterns with Class B customer templates. A clear package boundary reduces drift and prepares LinkApps/LEXOS post-MVO.

---

## Target end state

| Package | Contents | Consumers |
|---------|----------|-----------|
| `@linktrend/ui-primitives` (or layered exports) | shadcn-aligned Button, Input, Card, Dialog, StatusPill adapters | LiNKaios, LinkApps, internal tools |
| `@linktrend/ui-operator` (optional layer) | Data table, action queue, metric cards, form field stacks tied to operator UX | **LiNKaios only** — not customer sites |
| LinkSites vendor source | Marketing blocks, hero sections, industry tokens | Copied into templates — remains vendor model |

**Principle:** Customer sites never depend on operator shell composites at runtime.

---

## Proposed phases (post-MVO)

1. **Inventory** — diff `linkaios-web/src/components/ui` vs `packages/ui` vs LiNKsites vendored blocks; list duplicates.
2. **Primitive extraction** — move token-agnostic shadcn wrappers + shared types into `packages/ui`; `linkaios-web` re-exports during transition.
3. **Operator layer stays local** — keep composites in `linkaios-web` (or `packages/ui-operator` private to System) until API stabilizes.
4. **LinkSites alignment** — document which primitives are safe to vendor into templates; automate copy script (no npm dependency from templates).
5. **Publish gate** — versioned package, Storybook or Ladle catalog, `pnpm --filter @linktrend/ui build` in CI.

---

## Non-goals

- Extracting during MVO critical path
- Forcing LinkSites templates to `import '@linktrend/ui'` at runtime
- Moving LiNKaios shell chrome (`ShellMainFrame`, breadcrumbs) into shared package before operator UX stabilizes

---

## Success criteria (when implemented)

- [ ] Single build target for primitives used by LiNKaios and documented vendor list for LinkSites
- [ ] `UI_AUTHORITY.md` updated with package import rules
- [ ] Host skills reference package paths, not duplicated token docs
- [ ] No regression in MVO traceability dashboard or LinkSites publish loop

---

## Tracking

Create a LiNKdev program issue when Principal approves post-MVO extraction. Reference:

- `UI_AUTHORITY.md`
- `docs/ecosystem/development-plan/04_Repo_Strategy_and_Reuse_Map_v2.md`
- `LiNKdev/archive/ai-swarm-legacy/AGENT_REPORTS/LINKAIOS_UIUX_REVIEW_BACKLOG.md` (historical context only)

**Owner:** TBD — Integrator assigns after MVO ship.
