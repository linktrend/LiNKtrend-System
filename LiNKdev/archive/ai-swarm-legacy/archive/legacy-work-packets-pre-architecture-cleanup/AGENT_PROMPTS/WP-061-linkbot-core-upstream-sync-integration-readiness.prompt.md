# WP-061 Agent Prompt - LiNKbot-Core Upstream Sync And Integration Readiness

You are coordinating from `/Users/linktrend/Projects/LiNKtrend-System` and working on target repo `/Users/linktrend/Projects/LiNKbot-core`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-061-linkbot-core-upstream-sync-integration-readiness.md`.

## Current baseline

LiNKbot-core is the OpenClaw fork and is mostly done. This packet must sync/discover safely, then report what remains for LiNKaios/LinkSkills/LiNKbrain/LiNKautowork/Zulip integration.

## Branch workflow

1. In `LiNKtrend-System`, start from latest development:
   - `git fetch origin`
   - `git switch development`
   - `git pull --ff-only origin development`
   - `git switch -c dev/codex/WP-061-linkbot-core-upstream-sync-integration-readiness`
2. In `/Users/linktrend/Projects/LiNKbot-core`, inspect remotes/branches/status before changing anything.
3. Create a target repo branch if safe.
4. Do not force-push and do not create PRs to upstream original.
5. Commit coordination docs in `LiNKtrend-System` and push the coordination branch.

## Required reading

- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/WORK_PACKETS/WP-061-linkbot-core-upstream-sync-integration-readiness.md`
- `/Users/linktrend/Projects/LiNKbot-core`

## Mission

Sync and discover LiNKbot-core integration readiness. Preserve upstream safety, report exact git state, and identify adapter gaps.

## Hard boundaries

- No force-push.
- No upstream original PR.
- No live messaging sends.
- No secrets.

## Proof required

Record target repo remotes, branch/status before/after, sync commands, test/typecheck proof if code changed, and integration-readiness findings in `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`.
