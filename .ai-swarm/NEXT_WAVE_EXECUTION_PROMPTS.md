# Next Wave Execution Prompts

Use these one-line prompts to launch the wave. Each prompt points the agent to the full prompt file and required work packet.

1. **Codex** — `Execute .ai-swarm/AGENT_PROMPTS/WP-200-codex-integration-proof.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-200-codex-integration-proof.md as the work packet and update the required report before stopping.`
2. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-201-linkaios-operational-cockpit.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-201-linkaios-operational-cockpit.md as the work packet and update the required report before stopping.`
3. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-202-linkbrain-operator-intelligence.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-202-linkbrain-operator-intelligence.md as the work packet and update the required report before stopping.`
4. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-203-linkskills-governance-completion.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-203-linkskills-governance-completion.md as the work packet and update the required report before stopping.`
5. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-204-linkautowork-workflow-completion.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-204-linkautowork-workflow-completion.md as the work packet and update the required report before stopping.`
6. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-205-linkbot-runtime-completion.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-205-linkbot-runtime-completion.md as the work packet and update the required report before stopping.`
7. **Composer** — `Execute .ai-swarm/AGENT_PROMPTS/WP-206-linksites-proof-readiness.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-206-linksites-proof-readiness.md as the work packet and update the required report before stopping.`
8. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-207-lexos-litigation-mvo.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-207-lexos-litigation-mvo.md as the work packet and update the required report before stopping.`
9. **Kimi** — `Execute .ai-swarm/AGENT_PROMPTS/WP-208-linkapps-app-factory-mvo.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-208-linkapps-app-factory-mvo.md as the work packet and update the required report before stopping.`
10. **Composer** — `Execute .ai-swarm/AGENT_PROMPTS/WP-209-linkguard-rename-hardening.prompt.md exactly; use .ai-swarm/WORK_PACKETS/WP-209-linkguard-rename-hardening.md as the work packet and update the required report before stopping.`

## Launch Notes

- Run WP-201 through WP-209 in parallel first if using Cursor agents.
- Run WP-200 in Codex either in parallel for early blocker discovery or immediately after Cursor agents finish if Codex credits are tight.
- Every packet must use a clean packet-specific worktree and update its report file.
