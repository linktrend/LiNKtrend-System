# LiNKdev — Principal role (plain English)

Version: 2.0 · Status: active (2026-06-01)

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
| **Task stalled** | Active wave issue, no PR for 30+ minutes |

No secret = no Slack (factory unchanged). At most one alert per issue per hour (duplicate suppression).

GitHub issue comments remain the audit trail. Subscribe to issues only if you also want email.

| Marker | Meaning |
|--------|---------|
| `[linkdev-dispatch]` | Executor started |
| `[linkdev-agent-watch]` | Running / finished / failed (every ~5 min) |
| `[linkdev-auto-heal]` | Factory detected a stall and re-dispatched **without asking you** |

## When the factory needs you

Only when automation cannot decide:

- `linkdev:principal-stop` — strategic briefing
- `linkdev:blocked` **and** comment says **Principal decision required** (rare; most blocks are auto-healed)

If you see a scary email and no `linkdev:principal-stop`, ignore it unless you want detail.

See also: [DISPATCH.md](./DISPATCH.md)
