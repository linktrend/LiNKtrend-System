# WP-017 — Preview publishing upgrade (Payload + DigitalOcean)

## Objective

Promote WebsiteFactory preview publishing from static/local-only to Payload/LinkSites plus DigitalOcean-hosted preview/publish deployments, while preserving the existing local preview fallback.

## Owner agent

linkaios-agent (primary), linkautowork-agent (co-owner), devops-engineer (DigitalOcean deployment review)

## Execution mode

- Codex: publish pipeline wiring, callback/status handling, fallback behavior
- Antigravity: browser validation of published preview URL and lifecycle UI states
- DevOps/Architect: DigitalOcean strategy, deployment guardrails, rollback plan

## Allowed files

- `LiNKaios/linkaios-web/**` (preview publish status/trace surfaces)
- `packages/linklogic-sdk/**` (publish result contracts)
- `services/migrations/**` (publish metadata persistence only)
- `LiNKbot/runtime-adapters/openclaw/bot-runtime/**` only if publish payload contract requires adapter updates
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`

## Prohibited files

- CRM/Plane integration logic
- LiteLLM gateway implementation
- LEXOS implementation
- Removal of local preview fallback path
- Committed DigitalOcean tokens, SSH keys, registry credentials, or real customer data

## Dependencies

- WP-010/WP-011 plugin orchestration stable
- `preview.publish` lease path stable (WP-007)
- DigitalOcean deployment target confirmed by user
- DigitalOcean credentials, app/container strategy, registry path, and rollback owner available outside git

## Required proof

- Successful run returns externally reachable DigitalOcean-hosted preview URL and retains `preview_artifact_ref`
- Failed publish falls back to deterministic failure code and visible run state
- Audit proof for `preview.published` and publish-failure event path
- LinkSkills lease proof for hosted publish side effect
- Antigravity screenshot/flow evidence linked in agent report
- Rollback proof or documented rollback command/path

## Out of scope

Production DNS/SSL automation beyond preview-stage publish unless explicitly approved.
