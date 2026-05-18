# WP-061 - LiNKbot-core upstream sync and integration readiness

## Objective

Sync and discover `/Users/linktrend/Projects/LiNKbot-core` against its upstream source, then report what remains to make LiNKbot work with LiNKaios, LinkSkills, LiNKbrain, LiNKautowork, and Zulip.

## Repo / branch

- Coordination repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Target repo: `/Users/linktrend/Projects/LiNKbot-core`
- Target branch: `dev/codex/WP-061-linkbot-core-upstream-sync-integration-readiness` or equivalent in the target repo
- Coordination branch: `dev/codex/WP-061-linkbot-core-upstream-sync-integration-readiness`

## Allowed files

In target repo:
- Sync metadata, integration-readiness report files, and minimal conflict fixes if required to complete upstream sync.

In coordination repo:
- `.ai-swarm/LINKBOT_CORE_SYNC_READINESS.md`
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`
- `.ai-swarm/REPO_INVENTORY.md` only for factual updates

## Prohibited files

- Do not force-push.
- Do not push PRs to upstream original repo.
- Do not rewrite LiNKbot architecture.
- Do not add live Zulip/Telegram/Slack sends.
- Do not store secrets.

## Required context

- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `/Users/linktrend/Projects/LiNKbot-core`
- `.ai-swarm/WORK_PACKETS/WP-061-linkbot-core-upstream-sync-integration-readiness.md`

## Steps

1. Inspect target repo git remotes, branches, fork/upstream status, and dirty state.
2. If safe, fetch upstream and sync the fork branch according to existing repo policy. If conflicts occur, resolve minimally or report blockers.
3. Discover current OpenClaw/LiNKbot runtime surfaces, tool/message adapters, Slack/Telegram/Zulip hints, model routing, and extension points.
4. Identify required changes for LiNKaios work dispatch, LinkSkills governed skills/capabilities, LiNKbrain audit/memory, LiNKautowork deterministic workflow handoff, and Zulip communication.
5. Update coordination report with exact branches, commits, commands, proof, blockers, and next WPs.

## Acceptance criteria

- Upstream sync status is known and, if safe, completed.
- No upstream original PR is created.
- Integration readiness report is evidence-based.
- Next LiNKbot integration packets can be written from the report.

## Proof required

- `git -C /Users/linktrend/Projects/LiNKbot-core remote -v`
- branch/status before and after
- sync/fetch commands run
- test/typecheck evidence if any target repo code changes are made
