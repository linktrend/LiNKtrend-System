# Dev Swarm Specification (frozen core)

Version: 1.0  
Status: frozen for LiNKtrend bootstrap build

## 1. What Dev Swarm is

Dev Swarm is a **portable AI software factory**: Programs → Modules → Phases → **Issues**, coordinated through **GitHub + files**, with **Cursor-primary** control plane and **Codex** as peer executor automations.

Dev Swarm is **not** LiNKtrend-System, LinkSites MVO, or any product module. It lives in `dev-swarm/` and may be copied to other repositories.

## 2. Coordination (practical, not policy)

Agents do not share one chat session. Two Cursor cloud agents cannot message each other; Cursor cannot message Codex. Therefore coordination is:

- GitHub **labels** and merges
- **`dev-swarm/STATE.md`** (machine-readable)
- Issue specs, agent **reports**, branches, commits

This is capability-driven, not a ban on collaboration.

## 3. Hierarchy

| Level | Name | Meaning |
|-------|------|---------|
| 1 | **Program** | Body of work (e.g. bootstrap, linktrend-system) |
| 2 | **Module** | Major area inside program |
| 3 | **Phase** | Stage group inside module |
| 4 | **Issue** | Single agent assignment (formerly work packet) |

One issue → one executor pass → one report → Integrator merge to `development` (unless blocked).

## 4. Roles and runtimes

| Role | Default runtime | Responsibility |
|------|-----------------|----------------|
| **Planner** | Cursor | Pre-Go program plan, DAG, issue files, automation checklist |
| **Orchestrator** | Cursor automation | Advance STATE, set `swarm:ready`, chairman stops |
| **Executor** | Cursor or Codex | Implement issue spec on branch |
| **Reviewer** | Cursor automation | Spec + proof review; reject vacuous PASS |
| **Integrator** | Cursor automation | Merge to `development`; trigger next orchestrator pass |
| **Chairman** | Human | Go, Continue, staging/main, resolve escalations |

**Codex** is a **peer automation** to Cursor cloud executors: waits on the same GitHub labels (`swarm:ready` + `runtime:codex`). Not Chairman-triggered per issue.

**Antigravity** is out of core (optional ad hoc UI outside factory).

## 5. Loop

```
Planner (pre-Go) → Chairman Go →
  Orchestrator → Executor(s) → Reviewer → Integrator → Orchestrator → …
until program complete or swarm:chairman-stop
```

- **Integrator merge to `development`** triggers next Orchestrator pass.
- **Chairman Continue** clears chairman stop and resumes Orchestrator.

## 6. Bootstrap vs runtime

| Mode | When | Start work |
|------|------|------------|
| **Bootstrap** | Building Dev Swarm | Chairman one-line launcher → `programs/bootstrap/prompts/*.prompt.md` |
| **Runtime** | Product programs after wire | Automations + labels + STATE |

## 7. Branches

- Product integration branch: **`development`**
- Issue work: `issue/<id>-<slug>` or `dev/<machine><ide>` per host repo SOP
- Chairman only: **`staging`**, **`main`**

## 8. Labels

See [contracts/labels.md](contracts/labels.md).

Executor may set `swarm:merge-ready` only when `dev-swarm/scripts/verify.sh` exits 0 (tier-aware).

## 9. STATE

See [STATE.md](STATE.md) and [contracts/STATE.schema.json](contracts/STATE.schema.json). Orchestrator is authoritative writer during runtime.

## 10. Issue contract

Every issue includes frontmatter per [contracts/issue-frontmatter.schema.json](contracts/issue-frontmatter.schema.json):

- `runtime`: `cursor` | `codex`
- `tier`: `standard` | `critical`
- Testable `acceptance_criteria` and `proof_required`
- `allowed_files` / `prohibited_files`

Templates: [templates/issue.md](templates/issue.md), [templates/agent-report.md](templates/agent-report.md).

## 11. Reviewer rules (DS-B2, B3)

- Reject **vacuous PASS** (no commands, no artifacts).
- Map each acceptance criterion to proof evidence.
- Blockers return issue to `swarm:blocked` or leave `swarm:review-ready` with report notes.

## 12. Borrow pack

Optional gates: [BORROW-PACK.md](BORROW-PACK.md). Not full UBS.

## 13. Wire (one-time per repo)

Copy `dev-swarm/` → agent runs [install/WIRE-PROMPT.md](install/WIRE-PROMPT.md) → [install/CHECKLIST.md](install/CHECKLIST.md).

## 14. Portability

Copy only `dev-swarm/` to a new repo. LiNKtrend product folders are not required. Product-specific rules may remain in that repo's `.cursor/rules/`.

## 15. LiNKtrend hosting

This repo builds Dev Swarm under `dev-swarm/` while continuing product work elsewhere. Legacy `.ai-swarm/` migrates per [programs/linktrend-system/MIGRATION.md](programs/linktrend-system/MIGRATION.md).
