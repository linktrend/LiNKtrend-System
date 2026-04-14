# OpenClaw: shim vs real engine

## In this repo

- **`apps/openclaw-shim`**: a small HTTP service that accepts the ingress shape expected by **`apps/bot-runtime`** and can forward to a real OpenClaw / LiNKbot gateway using env vars (`OPENCLAW_AGENT_RUN_URL`, bearer token, body mode). Use it for local development and CI without a full OpenClaw stack.

## Production path

Point **`OPENCLAW_AGENT_RUN_URL`** (and related secrets) at your real agent gateway. The shim’s contract (governance payload, idempotency, optional `message`) is documented in each app’s `README` and env examples.

## Governance

`@linktrend/linklogic-sdk` builds **`linktrendGovernance`** (mission, manifest, approved skills). Bot-runtime attaches it to every run so downstream tools stay within LiNKlogic policy.
