# LinkSkills — Design Narrative

## Purpose

LinkSkills is the capability control plane of the LiNKtrend ecosystem. It governs what agents, workflows, and services are allowed to do. It is not just a skill library, not a prompt collection, and not a public protocol. It is the system that turns tools and procedures into safe, certified, auditable business capabilities.

In the full ecosystem, LinkBots request actions, LiNKaios coordinates work, LiNKautowork executes deterministic workflows, and LiNKbrain records outcomes. LinkSkills sits between intent and action. It answers whether a capability can be used, by whom, under what authority, at what cost, with what side effects, and with what evidence.

## Core Principle

The core principle is permission-bound execution. Agents should not have broad ambient access to tools, credentials, scripts, APIs, or workflows. They should receive short-lived capability leases for specific actions in specific contexts.

This is the central improvement over typical agent tool use. Many AI systems expose a large set of tools to an agent and trust the model to choose correctly. LinkSkills instead reduces the blast radius. It reveals only what is needed, only when needed, only for the allowed scope, and only long enough to perform the step.

## Capability Catalog

The capability catalog is the registry of what the ecosystem can do. Each capability has an identity, version, side-effect class, risk class, data classification, cost estimate, cost cap, idempotency rule, approval requirement, rollback/compensation rule, compatible execution modes, certification status, and evidence links.

This catalog should not be treated as the moat by itself. Tool registries and marketplaces are becoming common. The value of the catalog is that it is governed, versioned, certified, scoped, and connected to execution telemetry.

A capability can be atomic or composite. An atomic capability might be “read CRM contact” or “draft invoice.” A composite capability might be “run client onboarding workflow” or “publish approved website.” Composite capabilities can be backed by LiNKautowork workflows or Temporal workflows.

## Gold Skill Format

The Gold Skill Format is valuable as internal IP because it captures methodology, structured procedure, metadata, fail-fast phases, persistence rules, and convention-drift prevention. It should remain an internal certification envelope.

However, it should not be positioned as a public standard competing with MCP, Agent Skills, SKILL.md, AGENTS.md, A2A, or OpenAPI. The market is standardizing around those patterns. LinkSkills should wrap them, extend them, certify them, and govern them.

In practice, a skill package can contain a SKILL.md or Agent Skill, scripts, references, examples, tests, and a LinkSkills certification envelope. The envelope adds side-effect classification, cost, idempotency, approval rules, permissions, data classification, and certification evidence.

## Disclosure Broker

The disclosure broker is the heart of LinkSkills. When a LinkBot or workflow needs to act, it requests permission. LinkSkills evaluates the request and, if approved, issues a capability lease.

A capability lease includes tenant, principal, bot, workflow, run, capability, version, allowed inputs, allowed outputs, cost cap, duration, approval state, idempotency key, policy decision reference, trace identifier, and expiry.

This lease is then used to execute a tool, workflow, or skill. When execution ends, the lease expires. The agent should not retain the manifest or secret.

This just-in-time disclosure model protects skill IP, reduces tool overload, limits prompt injection damage, and improves auditability.

## Policy Engine

LinkSkills should use policy-as-code. OPA and OPAL are appropriate starting points. The policy layer should decide whether a capability may be disclosed or executed.

Policies check role, tenant, plugin, workflow stage, data class, side effect, approval requirement, cost cap, rate limit, idempotency, credential availability, region, regulated-mode status, and kill-switch status.

DPR should be treated as policy logic rather than a proprietary magic concept. The business value is deterministic validation of allowed paths and expected results. High-risk actions must have deterministic gates, approval states, and replay-safe semantics.

## Execution Adapters

LinkSkills should not perform every execution itself. It should route to execution substrates.

Execution adapters may include MCP servers, OpenAPI APIs, A2A agents, LiNKautowork workflows, Temporal workflows, sandboxed scripts, cloud functions, local CLI wrappers, OpenClaw/LinkBot runtime steps, and external SaaS APIs.

This makes LinkSkills agent-agnostic and runtime-agnostic. It also avoids building a giant execution engine.

## Run Ledger

Every capability execution should be recorded. The run ledger records the lease request, policy decision, approval, execution start, execution substrate, tool calls, retries, outputs, failures, compensation actions, cost, latency, model/tool identifiers, and final status.

This run ledger is one of the defensible assets. It creates the evidence base for certification, billing, audit, and improvement. It also feeds LiNKbrain.

## Certification Service

Capabilities should have lifecycle states: draft, sandboxed, internal beta, tenant-limited, certified, restricted, deprecated, and revoked.

The Curator service should evaluate capabilities using telemetry, synthetic tests, dirty-data scenarios, failure rates, cost profiles, incident history, and human feedback. It should recommend promotions or demotions. It should not autonomously promote high-risk capabilities without approval.

For read-only low-risk capabilities, automatic promotion may be acceptable under strict evidence thresholds. For write or external-action capabilities, human review or pre-approved policy is required.

## Integration With LinkBot

LinkBots consume LinkSkills. A bot should not decide on its own that it can send an invoice, publish a post, deploy a website, or update a CRM. It requests a capability lease. LinkSkills evaluates the request. If approved, the bot receives only the manifest or interface required for that step.

At session start, a bot may request its role-based JIT pack: the capabilities pre-bound to its role. This should be a view, not full uncontrolled access.

## Integration With LiNKautowork

LiNKautowork workflows should become LinkSkills capabilities once they are proven. A workflow such as “client onboarding” may begin as an internal n8n template. After testing and successful use, it is wrapped by LinkSkills as a certified capability. Then bots call the capability rather than directly manipulating n8n.

LinkSkills governs whether a workflow can be triggered, under which tenant, with which inputs, and whether approval is required.

## Integration With LiNKbrain

LinkSkills writes telemetry to LiNKbrain. LiNKbrain stores execution results, incidents, cost, failures, outcomes, and version performance. The Curator reads this evidence to propose capability improvements and routing changes.

This creates the learning loop: execution produces evidence, evidence creates memory, memory improves certification, certification improves execution.

## Integration With LiNKaios

LiNKaios uses LinkSkills to display capability catalogs, role permissions, skill telemetry, promotion proposals, approval queues, and kill switches. LiNKaios also installs vertical plugins whose roles pre-bind certain capabilities from LinkSkills.

LiNKaios is the control surface. LinkSkills is the capability authority.

## Open Source Strategy

Use Supabase/Postgres for catalog, run ledger, idempotency, billing, disclosure logs, and certification records. Use OPA/OPAL for policy. Use MCP, A2A, and OpenAPI for interoperability. Use Temporal for durable long-running capability jobs. Use n8n/LiNKautowork for deterministic workflows. Use E2B, Daytona, or Firecracker-based systems for sandboxing. Use OpenTelemetry and Langfuse/OpenLIT for traces. Use LiteLLM/OpenRouter for model routing and cost tracking. Use Infisical/OpenBao or cloud secret managers for secrets. Use Trivy, Semgrep, Gitleaks, Cosign, and SLSA patterns for scanning and signing.

Do not build custom sandboxing first. Do not create a public replacement for MCP. Do not make the registry itself the product.

## Repo Structure

LinkSkills should remain a separate repo.

A practical structure is:

- `services/api` for disclosure, runs, capability catalog, and billing endpoints.
- `services/policy-worker` for policy evaluation integration.
- `services/curator` for certification recommendations and evaluation loops.
- `services/evaluator` for synthetic and dirty-data tests.
- `skills/skill-template` for the Gold Skill Format.
- `skills/certified-skills` for internal certified skills.
- `policies/opa` for Rego policies.
- `db/migrations` for schemas.
- `packages/linkskills-ts` and `packages/linkskills-py` for SDKs.
- `docs/certification`, `docs/policies`, and `docs/capability-contracts`.

## Moat

The LinkSkills moat is not the existence of skills. The moat is governed execution: short-lived capability leases, side-effect policy, idempotency, certification, approval gates, cost control, execution telemetry, and integration with LiNKbrain and LiNKautowork.

For SMBs, the value is simple: AI employees can do real work safely. The owner can decide who can send invoices, who can publish, who can update CRM, who can spend money, and who needs approval.

## First Build

The first version should implement a capability catalog, role-to-capability prebinding, disclosure issue endpoint, run ledger, idempotency table, simple OPA policy, one or two certified skills, LinkBot SDK integration, LiNKautowork workflow trigger capability, and LiNKbrain telemetry export.
