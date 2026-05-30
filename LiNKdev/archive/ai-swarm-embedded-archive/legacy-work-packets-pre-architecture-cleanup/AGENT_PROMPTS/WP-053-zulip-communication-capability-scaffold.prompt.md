# WP-053 Agent Prompt - Zulip Communication Capability Scaffold

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-053-zulip-communication-capability-scaffold.md`.

## Current baseline

Zulip is intended as the LiNKbot communication channel for bot-to-bot and bot-to-operator messages. A real Zulip Droplet exists, but this packet must not require credentials or send live messages.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-053-zulip-communication-capability-scaffold`
5. Commit with message `feat: scaffold Zulip communication capability`
6. `git push -u origin dev/codex/WP-053-zulip-communication-capability-scaffold`

## Required reading

- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/05-security-cost-and-side-effects.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/INTEGRATION_QUEUE.md`
- `.ai-swarm/WORK_PACKETS/WP-053-zulip-communication-capability-scaffold.md`

## Mission

Find any existing Zulip/OpenClaw bridge work in this repo, then scaffold the governed Zulip communication capability surface without live sending.

## Hard boundaries

- No real Zulip messages.
- No secrets.
- No final stream taxonomy beyond minimal connector/run-message needs.

## Proof required

Record search evidence, changed files, and any test proof in the relevant agent report.
