# Four-Wave Closure Execution Prompts

Run one wave at a time. After each wave finishes, ask for an integration check before launching the next wave.

## Wave 1 — Baseline And Workflow Map

1. **Codex** — `Execute .ai-swarm/AGENT_PROMPTS/WP-210-baseline-fix-and-build-gate.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-210-baseline-fix-and-build-gate.md as the work packet and update the required report before stopping.`
2. **Composer** — `Execute .ai-swarm/AGENT_PROMPTS/WP-211-module-workflow-map-gap-prep.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-211-module-workflow-map-gap-prep.md as the work packet and update the required report before stopping.`

## Wave 2 — LinkSites Runtime Spine

1. **Codex** — `Execute .ai-swarm/AGENT_PROMPTS/WP-212-linksites-runtime-spine.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-212-linksites-runtime-spine.md as the work packet and update the required report before stopping.`
2. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-213-linksites-linkskills-enforcement.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-213-linksites-linkskills-enforcement.md as the work packet and update the required report before stopping.`
3. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-214-linksites-linkbot-role-execution.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-214-linksites-linkbot-role-execution.md as the work packet and update the required report before stopping.`
4. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-215-linksites-linkbrain-trace-proof.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-215-linksites-linkbrain-trace-proof.md as the work packet and update the required report before stopping.`

## Wave 3 — Cockpit And Proof Surface

1. **Codex** — `Execute .ai-swarm/AGENT_PROMPTS/WP-216-linkaios-cockpit-proof-surface.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-216-linkaios-cockpit-proof-surface.md as the work packet and update the required report before stopping.`
2. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-217-autowork-status-idempotency-visibility.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-217-autowork-status-idempotency-visibility.md as the work packet and update the required report before stopping.`
3. **Composer** — `Execute .ai-swarm/AGENT_PROMPTS/WP-218-linksites-proof-runbook-and-local-preview.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-218-linksites-proof-runbook-and-local-preview.md as the work packet and update the required report before stopping.`

## Wave 4 — Replicate Pattern And Final Audit

1. **Codex** — `Execute .ai-swarm/AGENT_PROMPTS/WP-219-lexos-linkapps-runtime-pattern-integration.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-219-lexos-linkapps-runtime-pattern-integration.md as the work packet and update the required report before stopping.`
2. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-220-lexos-litigation-operator-flow.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-220-lexos-litigation-operator-flow.md as the work packet and update the required report before stopping.`
3. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-221-linkapps-app-factory-operator-flow.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-221-linkapps-app-factory-operator-flow.md as the work packet and update the required report before stopping.`
4. **Codex** — `Execute .ai-swarm/AGENT_PROMPTS/WP-222-final-integration-proof-and-percentage-audit.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-222-final-integration-proof-and-percentage-audit.md as the work packet and update the required report before stopping.`

## Launch Notes

- Run each wave in parallel, except keep WP-222 last inside Wave 4 after WP-219 through WP-221 finish.
- Every packet must use a clean packet-specific worktree and update its report file.
- If a packet reports a proof failure, do not proceed to the next wave until the blocker is checked.
