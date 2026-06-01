# LiNKdev — Principal role (plain English)

Version: 2.1 · Status: active (2026-06-01)

## What LiNKdev is supposed to do

**LiNKdev runs itself.** Planner, orchestrator, executors, reviewers, and integrators work on GitHub. When something stalls or fails, **the factory fixes or re-dispatches automatically** — you do not babysit timers or interpret emails.

## Your job (only two cases)

| When | What you do |
|------|-------------|
| **Normal operation** | **Nothing.** Go do your work. |
| **Label `linkdev:principal-stop` on a program issue** | Read the briefing comment, then say **Continue** or **Stop** in any Cursor chat. |

You are **not** the on-call engineer for script lint failures, dispatch races, or stuck executors. Those are factory problems.

## Do not use these as your dashboard

- GitHub Actions failure emails (often misleading — one check failed, not the whole program)
- Cursor Web home (API-dispatched agents may not appear)
- Waiting 30 minutes to see if something stuck

## Optional visibility (if you want it)

**Slack (recommended):** Add GitHub Actions secret **`LINKDEV_SLACK_WEBHOOK_URL`** (Slack incoming webhook URL). The **LiNKdev agent watch** job posts plain-English alerts when:

| Slack message | Meaning |
|---------------|---------|
| **Your turn** | `linkdev:principal-stop` — Continue or Stop |
| **Blocked** | `linkdev:blocked` — factory stuck |
| **Task stalled** | Active wave issue, no PR for 15+ minutes |
| **Executor finished without PR** | Cloud agent FINISHED but no PR — auto-heal re-dispatching |
| **Executor failed twice without PR** | Auto-heal tried twice — you may need to intervene |

No secret = no Slack (factory unchanged). At most one alert per issue per cycle per hour (duplicate suppression uses per-cycle event keys).

GitHub issue comments remain the audit trail. Subscribe to issues only if you also want email.

| Marker | Meaning |
|--------|---------|
| `[linkdev-dispatch]` | Executor started |
| `[linkdev-agent-watch]` | Running / finished / failed (every ~5 min) |
| `[linkdev-auto-heal]` | Factory detected a stall and re-dispatched **without asking you** |
| `[linkdev-finished-no-pr]` | Executor FINISHED with no PR — immediate heal |
| `[linkdev-wave-ready]` | New wave labels applied — stall timer resets |
| `[linkdev-merge-sync]` | PR merged — issue marked done, STATE updated |

## What runs automatically (wave 3+)

| Cadence | Workflow | Purpose |
|---------|----------|---------|
| Every 5 min | **LiNKdev factory heartbeat** → **agent watch** | Poll Cursor agents, heal stalls, Slack alerts |
| On label | **LiNKdev dispatch** | Executor / reviewer / integrator / orchestrator |
| On merge to `development` | **dispatch-orchestrator-merge** | `linkdev:done`, STATE sync, orchestrator advance |

No manual trigger needed for heartbeat after deploy to `main`.

## Break glass (rare)

If automation is blocked and you must unblock manually:

1. Update `LiNKdev/factory/STATE.md` and issue labels on GitHub directly.
2. Run **LiNKdev dispatch** → role `orchestrator` from Actions, or merge a handoff PR via bootstrap workflows.
3. Document what you did in the program tracking issue.

Prefer the cloud orchestrator path for routine waves.

## When the factory needs you

Only when automation cannot decide:

- `linkdev:principal-stop` — strategic briefing
- `linkdev:blocked` **and** comment says **Principal decision required** (rare; most blocks are auto-healed)
- Slack **executor failed twice without PR** (after two auto-heal cycles)

If you see a scary email and no `linkdev:principal-stop`, ignore it unless you want detail.

See also: [DISPATCH.md](./DISPATCH.md), [OPERATIONAL_LEARNINGS.md](./OPERATIONAL_LEARNINGS.md)
