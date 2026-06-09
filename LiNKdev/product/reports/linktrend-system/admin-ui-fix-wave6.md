# Admin UI Fix — Wave 6 (Polish + Metrics)

**Branch:** `issue/admin-ui-fix`  
**Date:** 2026-06-10  
**Findings addressed:** 36, 37, 38, 39, 47, 49, 50, 51, 52, 53, 54, 55, 56 (57 deferred)

## Summary

Wave 6 closes metrics clarity, worker Models/Settings polish, LiNKskills toggle feedback, and lifecycle tab consolidation.

## Tracks

### 6A — Metrics (36–39, 38)

- `MetricsDashboard`: **Fixture data** vs **Live data** banners on page (not only shell badge).
- Sparse live deploy: KPI cards show **—** with **No runs in range** instead of misleading 0%/0 values (`metrics-kpi-views.ts`).
- Licensor Cost view: all cards labeled **fixture until billing + infra feeds are live**; sparse window shows em-dash values (`metrics-licensor-kpi-views.ts`).
- Admin metrics empty-state CTA: **Launch admin program** when on admin surface.
- Filter dropdowns: demo entities only when `LINKAIOS_UI_MOCKS` enabled (unchanged; verified).

### 6B — Title Case + live labeling (49, 51)

- Models form: **Save Models & Limits**, **Alert Threshold (Tokens)**, **Hard Cap (Tokens)**.
- Model category labels: Context Under/Over 100k.
- Shell badge copy: **Fixture data** / **Live data** (no “Mock data” label).
- Models tab subtitle states live registry persistence.

### 6C — Worker Models/Settings (50, 52, 53, 54, 55, 56)

- Save button right-aligned (`justify-end`).
- Token cap step **10,000**.
- Settings: LiNKbot ID shows system ID, registry status, role type — no Optional suffix.
- Organisation Profile marked **Required** with display name + position + description.
- Logs **View** opens session with `?panel=transcript` and highlights Transcript section.
- **Lifecycle** tab removed from subnav; controls moved to Settings footer (`#lifecycle`); `/lifecycle` redirects.

### 6D — LiNKskills toggles (47)

- `SkillsCatalogTable`: save confirmation message on toggle; **Fixture** pill on demo rows.
- Worker skills page: no silent demo connector/skill merge when mocks off.

### Deferred

- **57** Font pass — unchanged (Principal tracking separately).

## Verification

```bash
cd LiNKaios/linkaios-web && npm run typecheck
# exit 0
```

## Manual acceptance (DO, `LINKAIOS_UI_MOCKS=0`)

- [ ] `/admin/metrics` — Live data banner when sparse; KPI context says “No runs in range”
- [ ] `/admin/metrics?view=cost` — Licensor cards show fixture suffix
- [ ] `/admin/workers/{id}/models` — Save right-aligned; 10k token steps
- [ ] `/admin/workers/{id}/settings` — Required profile; lifecycle section at bottom
- [ ] `/admin/workers/{id}/skills` — Toggle saves with confirmation; no demo rows
- [ ] `/admin/workers/{id}/logs` — View opens transcript-focused session detail

## Findings status

| ID | Status |
|----|--------|
| 36 | Closed — page-level live/fixture banners |
| 37 | Closed — sparse KPI copy |
| 38 | Closed — licensor cost labeled fixture |
| 39 | Closed — no demo filter merge when mocks off |
| 47 | Closed — toggle feedback + fixture pills |
| 49 | Closed — live registry copy on Models |
| 50 | Closed — save alignment |
| 51 | Closed — Title Case on Models |
| 52 | Closed — 10k step |
| 53 | Closed — ID + role type, not Optional |
| 54 | Closed — Required org profile |
| 55 | Closed — logs View → transcript panel |
| 56 | Closed — lifecycle in Settings |
| 57 | Deferred |
