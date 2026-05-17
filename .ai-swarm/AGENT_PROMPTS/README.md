# Agent Prompts

Use these files as stable prompt payloads for external agents.

After an agent finishes and the Integrator has reviewed/merged its branch, the corresponding prompt file may be deleted.

## Required Clean Worktree Block

Every new large-wave prompt must include this requirement in its branch workflow:

```text
Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

1. Verify the starting checkout is clean with `git status --short --branch`.
2. If unrelated dirty files exist, stop before editing and report the blocker.
3. Create or use a packet-specific branch/worktree before making changes.
```

## One-Line Agent Commands

```text
WP-040 Execute the prompt in file WP-040-plugin-architecture-contract-v2.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-041 Execute the prompt in file WP-041-linksites-vertical-contract-v2.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-042 Execute the prompt in file WP-042-linksites-template-payload-discovery.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-043 Execute the prompt in file WP-043-capability-plugin-contract-pack-v1.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-044 Execute the prompt in file WP-044-linkbot-role-contract-pack-v1.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-045 Execute the prompt in file WP-045-linkautowork-linksites-workflow-contract.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-046 Execute the prompt in file WP-046-linksites-v2-sdk-contracts.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-047 Execute the prompt in file WP-047-linkskills-linksites-capability-catalog.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-048 Execute the prompt in file WP-048-linkautowork-linksites-workflow-scaffold.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-049 Execute the prompt in file WP-049-linksites-kernel-v2-stage-wiring.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-050 Execute the prompt in file WP-050-linkskills-v2-capability-execution-handlers.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-051 Execute the prompt in file WP-051-kernel-autowork-v2-handle-integration.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-052 Execute the prompt in file WP-052-linksites-v2-e2e-flow-harness.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-053 Execute the prompt in file WP-053-zulip-communication-capability-scaffold.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-054 Execute the prompt in file WP-054-odoo-crm-accounting-capability-discovery-scaffold.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-055 Execute the prompt in file WP-055-postiz-distribution-capability-scaffold.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-056 Execute the prompt in file WP-056-lexos-vertical-repo-discovery.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-057 Execute the prompt in file WP-057-linkapps-vertical-starter-kit-discovery.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-058 Execute the prompt in file WP-058-linkbrain-v2-audit-memory-coverage-review.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-059 Execute the prompt in file WP-059-linkautowork-completion-plan-runtime-hardening.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-060 Execute the prompt in file WP-060-linkskills-completion-plan-governance-service-hardening.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-061 Execute the prompt in file WP-061-linkbot-core-upstream-sync-integration-readiness.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-062 Execute the prompt in file WP-062-linkbot-linkaios-linkskills-zulip-adapter-plan.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-063 Execute the prompt in file WP-063-linkaios-ingress-fail-closed-governance-adapter.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-064 Execute the prompt in file WP-064-linkskills-lease-projection-and-bot-runtime-adapter.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-065 Execute the prompt in file WP-065-linkbrain-audit-envelope-mapping-for-linkbot-flow.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-068 Execute the prompt in file WP-068-linkautowork-persistent-idempotency.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-069 Execute the prompt in file WP-069-linkautowork-retry-backoff.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-070 Execute the prompt in file WP-070-linkautowork-n8n-dev-gateway.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-071 Execute the prompt in file WP-071-linkautowork-real-capability-calls.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-072 Execute the prompt in file WP-072-linkautowork-health-metrics.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-073 Execute the prompt in file WP-073-linkautowork-operator-controls.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-074 Execute the prompt in file WP-074-linkautowork-template-registry.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-075 Execute the prompt in file WP-075-linkskills-database-schema.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-076 Execute the prompt in file WP-076-linkskills-capability-catalog-api.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-077 Execute the prompt in file WP-077-linkskills-lease-lifecycle.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-078 Execute the prompt in file WP-078-linkskills-kill-switch.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-079 Execute the prompt in file WP-079-linkskills-golden-template.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-080 Execute the prompt in file WP-080-linkskills-progressive-disclosure.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-081 Execute the prompt in file WP-081-linkskills-integration-tests.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-082 Execute the prompt in file WP-082-linkbrain-completion-plan-memory-retrieval.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-083 Execute the prompt in file WP-083-linksites-completion-plan-payload-supabase-templates.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-084 Execute the prompt in file WP-084-lexos-vertical-plugin-conversion-plan.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-085 Execute the prompt in file WP-085-linkapps-vertical-plugin-conversion-plan.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-086 Execute the prompt in file WP-086-linkbrain-audit-ledger-completion.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-087 Execute the prompt in file WP-087-linkbrain-memory-object-schemas.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-088 Execute the prompt in file WP-088-linkbrain-context-assembler.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-089 Execute the prompt in file WP-089-linkbrain-learning-benchmarks.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-090 Execute the prompt in file WP-090-linksites-autowork-artifact-storage.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-091 Execute the prompt in file WP-091-linksites-supabase-payload-sync.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-092 Execute the prompt in file WP-092-linksites-frontend-preview-check.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-093 Execute the prompt in file WP-093-linksites-template-registry-discovery.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-094 Execute the prompt in file WP-094-lexos-schema-core.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-097 Execute the prompt in file WP-097-lexos-types-generation.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-103 Execute the prompt in file WP-103-lexos-capability-manifests.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-106 Execute the prompt in file WP-106-linkapps-plugin-manifest.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-107 Execute the prompt in file WP-107-linkapps-squad-orchestration.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-108 Execute the prompt in file WP-108-linkapps-capability-requirements.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-104 Composer: Execute the prompt in file WP-104-lexos-linkbot-role-contracts.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-105 Kimi: Execute the prompt in file WP-105-lexos-autowork-workflow-hooks.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-109 Kimi: Execute the prompt in file WP-109-linkapps-autowork-workflow-pack.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-110 Composer: Execute the prompt in file WP-110-linkapps-ui-panel-design.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-111 Kimi: Execute the prompt in file WP-111-linkapps-linkbrain-event-schema.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-112 Composer: Execute the prompt in file WP-112-linkapps-capability-plugin-contracts.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-113 Kimi: Execute the prompt in file WP-113-linksites-e2e-after-hardening.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-114 Composer: Execute the prompt in file WP-114-linkskills-cross-vertical-catalog-seeds.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-115 Kimi: Execute the prompt in file WP-115-linkaios-vertical-plugin-route-registration.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-116 Kimi: Execute the prompt in file WP-116-linkbrain-cross-vertical-trace-dashboard-schema.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-117 Kimi: Execute the prompt in file WP-117-linkskills-manifest-validation-cli.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-118 Kimi: Execute the prompt in file WP-118-linkautowork-run-control-integration.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-119 Kimi: Execute the prompt in file WP-119-linkbot-zulip-notification-adapter.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-120 Composer: Execute the prompt in file WP-120-linksites-local-proof-runbook-and-preflight.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-121 Kimi: Execute the prompt in file WP-121-lexos-server-query-mutation-scaffold.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-122 Kimi: Execute the prompt in file WP-122-lexos-ui-workspace-scaffold.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-123 Kimi: Execute the prompt in file WP-123-linkapps-sidebar-and-trace-integration.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-124 Composer: Execute the prompt in file WP-124-cross-system-mvo-readiness-scorecard.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-125 Kimi: Execute the prompt in file WP-125-linkskills-lease-ledger-test-pack.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
WP-126 Composer: Execute the prompt in file WP-126-linkbot-role-pack-validation.prompt.md located in .ai-swarm/AGENT_PROMPTS/.
```
