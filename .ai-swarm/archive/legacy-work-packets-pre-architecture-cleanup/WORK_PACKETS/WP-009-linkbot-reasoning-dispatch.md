# WP-009 — LiNKbot reasoning dispatch

## Objective

Wire LiNKbot reasoning dispatch for WebsiteFactory stages while keeping LiNKbot a thin runtime adapter.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md` §§6.1, 10, 12.3
- `.ai-swarm/DECISIONS.md` D-04, D-06
- `.ai-swarm/REPO_INVENTORY.md`
- `LiNKbot-core`
- `LiNKbot/runtime-adapters/openclaw/bot-runtime`

## Allowed files

- `LiNKbot/runtime-adapters/openclaw/bot-runtime/**`
- LiNKbot adapter files in this repo
- tests for bot-runtime
- `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`

## Prohibited files

- LiNKaios kernel orchestration implementation
- LinkSkills lease implementation
- LiNKbrain persistence implementation
- LiNKautowork workflow implementation
- Secrets, provider keys, direct env value changes

## Dependencies

- Start after WP-005 types are available or isolate local adapters until types land.
- Use OpenRouter routing only through configured model routing profile; do not add new provider architecture.

## Tasks

1. Inspect `LiNKbot/runtime-adapters/openclaw/bot-runtime` and `LiNKbot-core` integration points.
2. Implement or adapt `bot.reason` request handling for:
   - `lead_evaluation`
   - `template_selection`
   - `copy_generation`
   - `media_placement`
3. Return `BotReasonResult` with typed outputs and `model_run_id`.
4. Enforce `pii_policy="strip_contact"` before model prompts.
5. Emit or request audit events according to `CONTRACTS_MVO.md` without owning canonical memory.
6. Add tests or smoke proof for each reasoning kind with stubbed model responses if real provider access is unavailable.
7. Update `.ai-swarm/AGENT_REPORTS/linkbot-agent.md`.

## Acceptance criteria

- LiNKbot does not own memory, leases, secrets, deterministic workflows, or run state.
- Each reasoning kind returns the canonical output name expected by `CONTRACTS_MVO.md` §2.
- PII contact fields are stripped before model calls.
- Provider failures map to `MODEL_*` failure codes.

## Required proof

- Test/smoke command output for dispatch and PII stripping.
- Agent report includes prompt/input policy and output examples without secrets or real customer data.

## Out of scope

LiNKaios orchestration, approval UI, LinkSkills capabilities, workflow rendering, real CRM/Plane writes.
