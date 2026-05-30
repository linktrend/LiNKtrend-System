# Tool And Model Strategy v2

## Principle

Use the cheapest model that can safely complete the task. Expensive models are reserved for architectural decisions, integration review, and difficult debugging.

The MVO should not be coded mostly by Opus or GPT-5.5. Routine coding should be handled by Codex App and cost-effective coding models. Long-context repo reading should be handled by Gemini/Kimi-style models.

## Cursor

Use Cursor as the senior architecture and integration environment.

Best uses:

- reviewing the architect report
- wiring `dev-swarm/` (factory + command center)
- freezing architecture boundaries
- reviewing `REPO_INVENTORY.md`
- reviewing and editing `CONTRACTS_MVO.md`
- reviewing major branch diffs
- resolving conflicts between services
- producing final integration instructions

Cursor Opus should be used sparingly. It should not scan entire repos unless there is no cheaper way.

## Gemini / Kimi Long-Context

Use Gemini/Kimi for repo verification and summarization.

The architect review already provides a strong map. The repo archaeologist should not rediscover everything from zero. It should verify and expand the known map.

Use Gemini/Kimi for:

- scanning `/Users/linktrend/Projects`
- scanning `/Users/linktrend/Projects/Archive`
- verifying repo facts
- summarizing existing code
- identifying reusable APIs/migrations/templates
- checking whether LinkSkills disclosure endpoints exist
- comparing current `LiNKbot-core` vs archive `LiNKopenclaw`

## Codex App

Codex App is the primary coding workforce.

Use Codex for:

- API endpoints
- migrations
- SDK stubs
- adapters
- service wiring
- tests
- Docker fixes
- local run scripts
- branch commits

Codex agents should work from issues under `dev-swarm/product/programs/linktrend-system/issues/` and update `dev-swarm/product/reports/`.

## Antigravity

Use Antigravity for UI and browser validation.

Best uses:

- LiNKaios dashboard wiring
- local preview-site verification
- browser flow testing
- visual inspection
- Playwright-style tests
- UI regression checks

## OpenRouter

Use OpenRouter for model flexibility and cost control.

Use cheaper models for boilerplate, tests, documentation, and repo summarization.

Use premium models only for hard decisions.

## Local LLMs

Use local LLMs only for low-risk summaries or drafts if they do not slow the sprint. Do not make local inference a dependency for MVO completion.

## Model Allocation

Repo verification: Gemini/Kimi long-context.

Architecture review: Cursor Opus or GPT-5.5 Thinking.

Routine coding: Codex App with cost-effective coding models.

UI/browser testing: Antigravity.

Difficult debugging: Codex first, Opus/GPT-5.5 only if stuck.

Documentation: cheaper models first.

## Cost Control

Do not repeatedly send full design docs to premium models. Use the architecture docs and architect report as files in the repo. Agents should read local files, not require pasted context.
