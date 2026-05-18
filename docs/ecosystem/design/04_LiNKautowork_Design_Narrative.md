# LiNKautowork — Design Narrative

## Purpose

LiNKautowork is the deterministic workflow execution plane of the LiNKtrend ecosystem. It exists because AI agents should not burn expensive model tokens on routine, repeatable, low-judgment work. When a task can be expressed as a predictable workflow, LiNKautowork should run it.

In practical terms, LiNKautowork is a managed, governed, AI-ready automation system built initially on n8n Community and wrapped by a custom gateway. The gateway enforces tenant security, signed ingress, secrets handling, audit, event publishing, and kill switches. The n8n runtime provides workflow execution and integrations. The surrounding Linktrend layer makes it safe and part of the larger operating system.

## Core Principle

The core principle is deterministic-when-possible. Agent reasoning is useful for ambiguity, planning, judgment, communication, exception handling, and strategic decisions. It is wasteful for repeatable tasks such as creating folders, updating CRM records, generating recurring reports, checking DNS, sending internal notifications, or moving data between systems.

LiNKautowork turns repeated agent behavior into deterministic workflows. This is a major cost and reliability advantage. Once a workflow is proven, a bot should trigger it rather than reason through the same steps again.

## Role In The Ecosystem

LiNKautowork is not LiNKaios. It is not LinkSkills. It is not LiNKbrain. It is the execution engine for routine workflows.

LiNKaios decides that work exists and routes it. LiNKbot reasons about ambiguous steps and delegates execution. LinkSkills determines whether the workflow can be triggered. LiNKautowork executes the workflow. LiNKbrain records what happened and learns from it.

This separation is essential. If LiNKbot do all automation, costs explode. If n8n directly executes everything without policy, governance fails. If LinkSkills tries to run all workflows, it becomes too broad. LiNKautowork is the dedicated deterministic plane.

## n8n Runtime

n8n Community is the correct first runtime because it is self-hosted, broad in integrations, fast to develop with, visual enough for operators, and already familiar to many automation builders. It should not be exposed raw to customers or agents. It should be wrapped.

The raw n8n runtime executes workflow JSON. The Linktrend gateway sits in front and controls ingress, tenant identity, secrets, audit, capability leases, and kill-switch behavior.

## Policy Gateway

The gateway is what turns n8n into LiNKautowork.

The gateway should enforce HMAC signatures, timestamps, nonces, service-token validation, tenant validation, lineage validation, workflow version validation, idempotency keys, LinkSkills capability lease validation, secret retrieval, rate limits, cost checks, and kill switches.

It should also write canonical audit records and publish events to LiNKaios and LiNKbrain. No production workflow should be triggered by an agent directly calling n8n without passing through the gateway.

## Workflow Template Registry

LiNKautowork should maintain a workflow template registry. Each template should have a name, version, tenant compatibility, required capabilities, required credentials, input schema, output schema, side-effect class, test suite, approval requirement, risk class, and promotion state.

Canonical workflow templates live in source control. Deployed live snapshots should be exported back from n8n into `automations/live/dev` and `automations/live/prod` for audit and reproducibility. This prevents “production drift” where the n8n UI changes without repo traceability.

Templates can be tenant-customized, but the customization should be explicit and versioned.

## Autoworker Squad

The Autoworker Squad is a strong concept and should be kept, but each role needs precision.

Scout observes LiNKbrain and LiNKaios to identify repeated patterns that are still being done manually or by agent reasoning. If the same sequence happens repeatedly, Scout proposes automation.

Architect builds the n8n workflow or modifies an existing template. Architect should work against typed input/output schemas and capability contracts.

Auditor stress-tests the workflow against dirty data. A good target is not merely one happy path. It should test missing fields, malformed data, API failures, duplicate triggers, slow responses, conflicting states, partial failures, and idempotency.

Maintainer monitors production drift, API changes, workflow failures, execution cost, timeout rates, and tenant-specific overrides.

## Workflow Promotion

A workflow should not become a reusable certified capability immediately. It should pass through stages.

It may begin as an experimental tenant workflow. If it works, it becomes a reusable template. If used successfully across enough ventures or tenants, it becomes a candidate for LinkSkills certification. LinkSkills then wraps it as a capability. Once certified, LiNKbot call it through LinkSkills rather than directly invoking n8n.

This is the system’s automation flywheel: agent work becomes workflow, workflow becomes certified capability, certified capability becomes reusable across verticals, and LiNKbrain learns from outcomes.

## Integration With LiNKbot

A LiNKbot should delegate to LiNKautowork when a deterministic workflow exists. The bot may decide that client onboarding is needed, but it should not manually create folders, CRM records, project boards, invoice drafts, and notifications. It should request the onboarding capability through LinkSkills. If the capability maps to LiNKautowork, the workflow runs.

The bot receives result or exception information. If the workflow completes, the bot communicates outcome. If the workflow fails, the bot handles the exception or escalates.

## Integration With LinkSkills

LiNKautowork workflows should be registered with LinkSkills as executable capabilities. LinkSkills determines whether a bot, workflow, or service may trigger them.

For example, “create invoice draft” may be a LinkSkills capability backed by a LiNKautowork workflow that uses Odoo or QuickBooks. LinkSkills controls the permission. LiNKautowork performs the deterministic steps.

## Integration With LiNKbrain

LiNKautowork writes workflow run events to LiNKbrain. LiNKbrain tracks successes, failures, incidents, recurring exceptions, cost savings, and promotion evidence.

If a workflow fails repeatedly, LiNKbrain can create an incident memory. If a workflow saves significant agent time, LiNKbrain can surface that as ROI. If a workflow appears valuable across tenants, LiNKbrain can recommend promotion.

## Integration With LiNKaios

LiNKaios shows workflows, templates, active runs, failures, cost savings, audit traces, and automation opportunities. It should allow admins to enable or disable workflows, configure tenant-specific credentials, inspect workflow versions, and trigger manual runs when appropriate.

LiNKaios is the control panel. LiNKautowork is the runtime.

## Open Source Strategy

The first runtime should be n8n Community. Use Supabase/Postgres for workflow registry, audit metadata, template metadata, and run summaries. Use object storage or Git for workflow JSON snapshots. Use OPA for gateway policy if needed. Use Infisical, OpenBao, or Google Secret Manager for secrets. Use OpenTelemetry for tracing. Use Playwright and synthetic data generators for workflow tests. Use Docker Compose for self-hosting.

Temporal should be considered later for more durable internal workflows that require stronger replay semantics than n8n. Windmill can be considered for code-first workflows. Kestra can be considered for more enterprise-grade orchestration. But n8n is the correct SMB-facing starting point.

## Repo Structure

LiNKautowork should be a separate repo.

A practical structure is:

- `gateway` for signed ingress, tenant validation, policy, and audit.
- `n8n` for Docker Compose and runtime configuration.
- `automations/templates` for canonical workflow templates.
- `automations/live/dev` and `automations/live/prod` for exported deployed snapshots.
- `automations/tests` for dirty-data test cases.
- `db/audit-schema` for workflow audit structures.
- `packages/linkautowork-ts` and `packages/linkautowork-py` for SDKs.
- `docs/workflow-authoring`, `docs/gateway-security`, and `docs/promotion`.
- `tools/export-live-workflows` and `tools/validate-workflow`.

## Moat

The LiNKautowork moat is not that it uses n8n. The moat is that it turns repeated AI work into governed, tested, reusable automations. It combines automation templates, dirty-data tests, policy gateway, skill certification, memory feedback, and SMB-specific workflow packs.

For SMBs, the value is cost and reliability. AI employees are useful but expensive if they reason through every routine action. LiNKautowork makes the AI workforce economically viable.

## First Build

The first version should deploy n8n behind the gateway, implement signed ingress, tenant validation, one or two workflow templates, audit writeback to LiNKbrain, a LinkSkills capability wrapper, and a simple dashboard in LiNKaios. The first workflows should be WebsiteFactory workflows such as lead intake, folder/project creation, DNS check, website audit, proposal packet creation, invoice draft, and CRM update.
