# Execute: Pre-Wiring Readiness

**Trigger phrase:** `execute pre-wiring readiness`

**Integrator:** Parent Cursor agent (this session when Chairman says execute).

**Master plan:** `dev-swarm/command-center/PRE_WIRING_READINESS_PLAN.md`

---

## Integrator loop (each wave)

1. Pull latest `development`
2. Launch parallel subagents (Task tool) with prompt files below
3. Review reports + diff; resolve conflicts
4. Run `cd LiNKaios/linkaios-web && npm run typecheck` (and `build` on waves 1, 7)
5. Commit + push `origin development`
6. Proceed to next wave

---

## Wave 0 — Baseline (Integrator, no subagents)

Read and run: `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W0-integrator-baseline.prompt.md`

---

## Wave 1 — Parallel (2 agents)

| Agent | Prompt | Suggested model |
|-------|--------|-----------------|
| W1-A | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W1-A-shadcn-init.prompt.md` | Codex / Composer |
| W1-B | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W1-B-ui-system-doc.prompt.md` | Composer |

**Integrator commit message:** `feat(ui): shadcn foundation and ui-system index`

---

## Wave 2 — Parallel then sequential

**2a parallel:**

| Agent | Prompt |
|-------|--------|
| W2-A | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W2-A-project-create-api.prompt.md` |
| W2-C | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W2-C-project-ux-fixes.prompt.md` |

**Gate:** Merge both to `development`, verify POST works.

**2b sequential:**

| Agent | Prompt |
|-------|--------|
| W2-B | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W2-B-wizard-wireup.prompt.md` |

**Integrator commit message:** `feat(projects): create API stub and wizard wire-up`

---

## Wave 3 — Parallel (3 agents)

| Agent | Prompt |
|-------|--------|
| W3-A | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W3-A-stub-honesty.prompt.md` |
| W3-B | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W3-B-terminology-wave5.prompt.md` |
| W3-C | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W3-C-button-bridge.prompt.md` |

**Integrator commit message:** `fix(ui): stub honesty, terminology wave 5, button bridge`

---

## Wave 4 — Parallel (2 agents)

| Agent | Prompt |
|-------|--------|
| W4-A | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W4-A-shell-error-venture.prompt.md` |
| W4-B | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W4-B-settings-ux.prompt.md` |

**Integrator commit message:** `fix(ui): shell error pages, venture reskin, settings UX`

---

## Wave 5 — Parallel (2 agents)

| Agent | Prompt |
|-------|--------|
| W5-A | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W5-A-entity-table-migration.prompt.md` |
| W5-B | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W5-B-polish.prompt.md` |

**Integrator commit message:** `refactor(ui): DataTable migration and polish`

---

## Wave 6 — Single agent

| Agent | Prompt |
|-------|--------|
| W6-A | `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W6-A-mission-api-surface.prompt.md` |

**Integrator commit message:** `feat(api): projectId alias on mission API surface`

---

## Wave 7 — Integrator proof

Read and run: `dev-swarm/programs/linktrend-system/prompts/legacy/PWR-W7-integrator-proof.prompt.md`

---

## Subagent launch template (Integrator copy)

For each packet, Task tool:

```
Execute work packet: [PWR-Wx-Y]
Read: dev-swarm/programs/linktrend-system/prompts/legacy/PWR-Wx-Y-*.prompt.md
Branch from origin/development. Use worktree under .worktrees/ if parallel.
Commit on packet branch, push, update AGENT_REPORTS.
Return: commit SHA, files changed, proof commands output, blockers.
```

---

## Estimated effort

| Wave | Human team | CC + subagents |
|------|-----------|----------------|
| 0 | 2 h | 20 min |
| 1 | 1 day | 1–2 h |
| 2 | 1 day | 2–3 h |
| 3 | 4 h | 1–2 h |
| 4 | 4 h | 1 h |
| 5 | 1 day | 2 h |
| 6 | 4 h | 1 h |
| 7 | 2 h | 30 min |

**Total:** ~4–5 dev-days human → **~1–2 sessions** with parallel agents.

---

## Out of scope (wiring sprint)

- Real Supabase project insert
- Plane capability lease + live sync
- Settings payment/session backends
- Mission D DB migration

These are documented in the handoff after Wave 7.
