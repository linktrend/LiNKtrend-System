# Cost Control And Model Allocation v2

## Budget

Target discretionary spend is approximately USD 1,000, but the goal is to spend less.

The architect review indicates the largest constraint is supervision/integration, not token budget.

## Spending Strategy

Use cheap models for broad reading and summaries.

Use Codex and cost-effective coding models for implementation.

Use premium reasoning only for integration, contracts, and difficult blockers.

## Suggested Allocation

- $100–150: repo verification
- $150–250: architecture/integration review
- $250–400: implementation support
- $100–150: UI/testing/debugging
- $100: deployment/debug reserve
- $100: emergency reasoning reserve

## Model Tasks

Gemini/Kimi: repo verification, summarization, path mapping, old-code comparison.

Codex App: implementation, tests, migrations, Docker, SDKs.

Cursor Opus/GPT-5.5 Thinking: architecture conflicts, final review, contract decisions.

Antigravity: UI and browser testing.

OpenRouter cheaper models: boilerplate, docs, tests, summaries.

## Cost Rule

Never ask premium models to rediscover what the architect report already found unless facts conflict.

Use the architect report as the starting map.

## Escalation Rule

A cheap model can propose. A premium model decides only when the decision is high risk.
