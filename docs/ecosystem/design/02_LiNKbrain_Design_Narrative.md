# LiNKbrain — Design Narrative

## Purpose

LiNKbrain is the institutional memory and learning plane for the LiNKtrend AI agent ecosystem. Its role is to make sure that the organization remembers what happened, learns from repeated work, retrieves the right context, preserves auditability, and improves over time.

LiNKbrain is not a chatbot memory feature. It is not just a vector database. It is not just a folder of summaries. It is the system that turns operational history into governed institutional intelligence.

In the full ecosystem, LinkBots reason, LinkSkills governs what actions are allowed, LiNKautowork executes deterministic workflows, and LiNKaios coordinates the organization. LiNKbrain records the resulting history, turns it into memory objects, assembles context for future tasks, and produces benchmark intelligence.

## Core Principle

The foundational principle is that raw events are canonical and memory is derived. Every meaningful system event should be preserved in an event ledger. Memory objects are then created from those events. This allows memory to be corrected, regenerated, re-embedded, invalidated, and improved without losing the original source of truth.

This distinction matters because agent memory systems can easily become polluted. A bad summary can distort a later summary, which distorts a higher-level synthesis, until the system confidently remembers something that never happened. LiNKbrain avoids this by preserving provenance and making every memory object traceable to its source events.

## What LiNKbrain Stores

LiNKbrain stores several categories of information.

The first category is raw event history. This includes LinkBot sessions, LinkSkills capability leases and executions, LiNKautowork workflow runs, LiNKaios workflow transitions, approvals, tool calls, prompts, outputs, artifacts, errors, retries, costs, and human decisions.

The second category is typed memory objects. These are derived from raw events. They include facts, episodes, incidents, procedures, policies, evaluations, benchmarks, preferences, and artifact references.

The third category is context assembly records. Whenever an agent asks for context, LiNKbrain should record what was requested, what was returned, what was excluded due to policy, what sources were used, and what later happened. This allows retrieval quality to be evaluated.

The fourth category is cross-tenant collective intelligence, if enabled. This must not include raw tenant memory. It includes anonymized benchmark telemetry, procedural statistics, abstracted incident categories, and k-anonymized patterns.

## Memory Objects

Memory objects are the working units of LiNKbrain. A memory object should not be a vague blob of text. It should have a type, scope, provenance, state, validity, owner, source events, and confidence/freshness metadata.

A fact is something believed to be true, such as “this tenant uses Odoo for invoicing” or “this client prefers formal email tone.” An episode records something that happened in a session or workflow. An incident captures a failure, root cause, and remediation. A procedure captures reusable operational guidance. A policy captures a rule or constraint. An evaluation captures an outcome. A benchmark captures aggregate patterns.

Each memory object should move through lifecycle states such as candidate, approved, active, superseded, invalidated, expired, and archived. This keeps the memory system governable. Not every extracted observation should be immediately trusted.

## Scope Lattice

LiNKbrain needs a scope lattice. Memory should not be retrieved merely because it is semantically similar. It must also be authorized, relevant, and properly scoped.

Scopes include tenant, plugin, vertical, project, workflow, workflow stage, role, bot, user, region, data class, memory tier, and cross-tenant mode. A WebsiteFactory bot should not access a regulated law firm’s private matter memory. A read-only SEO Analyst Bot should not retrieve approval-only billing data. A tenant that disables cross-tenant learning should not contribute to the collective intelligence plane.

The scope lattice is a core governance mechanism. It is also a retrieval quality mechanism. It prevents the system from overloading agents with irrelevant material.

## Context Assembly

The most important product surface of LiNKbrain is not memory search. It is context assembly.

A LinkBot should not ask LiNKbrain for “everything about this client.” It should ask for a context bundle for a specific task, role, workflow stage, and authorization scope. LiNKbrain should assemble the smallest useful package: relevant facts, current project state, applicable procedures, prior incidents, active policies, approved exemplars, benchmark signals, warnings, and source references.

This is the practical version of the library-card idea. The system should not load the whole library. It should navigate the catalog, identify the shelf, select the book, open the chapter, and retrieve the relevant section.

The retrieval stack can use metadata filters, keyword search, vector search, recency scoring, entity lookup, role/workflow filters, and graph traversal. But those are lower-level tools. The higher-level function is query planning and context assembly.

## Recursive Synthesis

LiNKbrain should support temporal synthesis, but this should be handled carefully. It can create daily, weekly, monthly, and yearly summaries, but those summaries should be derivative, not canonical. They are useful for navigation and long-term pattern recognition, but they must preserve provenance and drill-down links to lower-level events.

The early system should avoid overbuilding recursive rollups. Start with event-to-episode, episode-to-procedure, and incident-to-remediation patterns. Add daily/monthly synthesis after retrieval, provenance, and evaluation are working.

## Cross-Tenant Collective Intelligence

Cross-tenant learning should exist from day one but in constrained form. Ordinary unregulated SMBs may have cross-tenant benchmark contribution enabled by default, with clear disclosure. Regulated tenants should default to private mode. Regulated clients can explicitly opt in where legally acceptable.

The rule is absolute: raw memory never crosses tenant boundaries. Documents, prompts, outputs, customer-specific examples, private facts, and tenant-specific records do not enter the collective plane.

Permitted collective intelligence includes anonymized telemetry, k-anonymized procedural statistics, model/tool performance benchmarks, failure rates, generalized incident classes, and abstracted best-practice patterns. For example, LiNKbrain should not share “Client Acme failed DNS because of Cloudflare setting X.” It may share “For SMB website deployments using external DNS, pre-SSL DNS propagation checks reduce deployment failures across at least fifteen tenants.”

This is a key moat because SMBs benefit from patterns learned across other businesses while private data remains isolated.

## Integration With LinkBot

A LinkBot uses LiNKbrain at the beginning, during, and after work. Before reasoning, it requests context. During work, it may write observations or memory candidates. After work, it writes outcome events, incidents, lessons, or evaluation data.

The LinkBot should not store long-term memory locally as canonical truth. OpenClaw-style local rollups may be useful as runtime cache, but LiNKbrain must be authoritative.

## Integration With LinkSkills

LinkSkills writes execution evidence to LiNKbrain. Every capability lease, policy decision, skill execution, failure, cost, and certification-relevant event can become memory input.

LiNKbrain helps LinkSkills improve. It can identify which skills fail, which versions perform better, which models are cost-effective for certain task classes, and which capabilities should be promoted, restricted, or deprecated.

## Integration With LiNKautowork

LiNKautowork writes deterministic workflow events to LiNKbrain. This is crucial because institutional learning should include not only agent reasoning but also routine workflow execution.

LiNKbrain can identify repeated manual actions that should become automations. It can detect workflow drift, recurring failures, cost savings, and automations suitable for promotion to LinkSkills.

## Integration With LiNKaios

LiNKaios reads LiNKbrain for memory views, audit traces, metrics, operational pulse, project state, and dashboard insights. LiNKaios also writes kernel events such as plugin installs, role provisioning, workflow transitions, and approvals.

LiNKaios is the control surface. LiNKbrain is the memory and evidence store behind it.

## Open Source Strategy

LiNKbrain should use Postgres/Supabase for canonical events and memory objects. Use pgvector for v1 vector retrieval. Use object storage for large artifacts. Use OpenTelemetry for traces. Use Langfuse or OpenLIT for AI observability. Use Temporal or n8n for background memory jobs. Use Graphiti later as a temporal graph projection, not as source of truth. Borrow extraction/update ideas from Mem0 and memory tiering concepts from Letta, but do not depend on either as the platform core.

OB1 is philosophically aligned but should not be the canonical dependency. It can be studied or supported via adapter, but LiNKbrain’s event schema, scope lattice, and context assembler should remain controlled by Linktrend.

## Repo Structure

LiNKbrain should be a separate repo.

A practical structure is:

- `services/api` for REST/MCP/API access.
- `services/workers` for memory extraction, promotion, synthesis, and cleanup.
- `services/context-assembler` for context bundle generation.
- `db/migrations` for schemas.
- `packages/linkbrain-ts` and `packages/linkbrain-py` for SDKs.
- `schemas/events`, `schemas/memory-objects`, and `schemas/context-bundles`.
- `docs/architecture`, `docs/memory-governance`, and `docs/evals`.
- `tests/retrieval`, `tests/context-assembly`, and `tests/privacy`.

## Moat

The LiNKbrain moat is not storage. It is the governed path from execution history to action-improving memory. It is the ability to remember across bots, workflows, tenants, and time while respecting scope, privacy, provenance, and auditability.

For SMBs, the value is simple: their AI employees stop repeating mistakes, remember clients, learn from prior work, benefit from benchmark intelligence, and remain auditable.

## First Build

The first version should implement event ledger, typed memory objects, basic context assembly, simple retrieval, LinkBot write/read integration, LinkSkills run-event intake, LiNKautowork workflow-event intake, and a minimal cross-tenant benchmark table for unregulated WebsiteFactory metrics.
