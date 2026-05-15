# WP-049 Agent Prompt - LinkSites Kernel V2 Stage Wiring

You are working in `/Users/linktrend/Projects/LiNKtrend-System`.

Execute work packet `.ai-swarm/WORK_PACKETS/WP-049-linksites-kernel-v2-stage-wiring.md`.

## Current baseline

WP-040 through WP-048 are integrated into `origin/development`. LinkSites v2 contracts, SDK schemas, LinkSkills catalog entries, and LiNKautowork workflow scaffolds exist. Branch from latest `origin/development`.

## Branch workflow

1. `git fetch origin`
2. `git switch development`
3. `git pull --ff-only origin development`
4. `git switch -c dev/codex/WP-049-linksites-kernel-v2-stage-wiring`
5. Commit with message `feat: wire LinkSites v2 kernel stages`
6. `git push -u origin dev/codex/WP-049-linksites-kernel-v2-stage-wiring`

## Required reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/04-mvo-scope-and-stubbing.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/LINKSITES_VERTICAL_MVO_V2.md`
- `.ai-swarm/LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`
- `.ai-swarm/WORK_PACKETS/WP-049-linksites-kernel-v2-stage-wiring.md`

## Mission

Wire the LiNKaios kernel/plugin stage plan for LinkSites v2. Keep LiNKaios as coordinator only; do not absorb LinkSkills, LiNKautowork, LinkBot, or LiNKbrain responsibilities.

## Hard boundaries

- No live external writes.
- No target software schema invention.
- No edits in `/Users/linktrend/Projects/LiNKsites`.

## Proof required

Run relevant Linkaios kernel/plugin tests and record exact proof in `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`.
