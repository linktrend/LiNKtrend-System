# LiNKbot — Design Narrative

## Purpose

A LiNKbot is a role-bound AI employee inside the LiNKtrend ecosystem. It is not merely an agent process. It is an institutional actor that belongs to a tenant, a module, and a role. It has a runtime core, persona, memory scopes, skill permissions, model routing, cost caps, and governance gates.

Current repo ownership for this system lives under `LiNKbot/`, with OpenClaw as the first runtime adapter. Completion criteria are defined in `docs/architecture/system-completion-targets.md`.

The user-facing metaphor is an employee. The engineering reality is a runtime adapter bound to organizational contracts.

A LiNKbot may run on OpenClaw, Agent Zero, LangGraph, Claude Code-like systems, Cursor/Codex-like systems, or future runtimes. The goal is not to make OpenClaw permanent. The goal is to make LiNKbot runtime-agnostic while using OpenClaw and Agent Zero as strong first cores.

## Core Principle

A LiNKbot should be a thin reasoning shell over externalized memory, externalized capabilities, externalized automations, and externalized governance.

The bot should keep what agents are good at: reasoning, ambiguity handling, planning, communication, prioritization, exception handling, and role-specific judgment.

It should not own canonical long-term memory, permanent secrets, broad tool permissions, workflow automation definitions, or institutional learning. Those belong to LiNKbrain, LinkSkills, LiNKautowork, and LiNKaios.

## The LiNKbot Record

Mechanically, a LiNKbot is a database record. It should include tenant ID, module ID, role ID, agent core, runtime adapter, display name, persona baseline, persona overlay, model routing profile, allowed memory scopes, allowed capability scopes, allowed autowork scopes, daily cost cap, approval threshold, and status.

The bot is hired into a role declared by a module or shared role pack. If the WebsiteFactory module declares Studio Manager, SEO Analyst, Website Scout, and Sales Ops roles, LiNKaios can hire bots into those roles. Hiring creates the bot record, generates credentials, binds the runtime, applies persona overlay, assigns memory scopes, and pre-binds allowed capabilities.

## Persona Model

Every LiNKbot inherits the Senior Sovereign Baseline Persona. That baseline establishes executive-level judgment, disciplined communication, accountability, and audit awareness. The role-specific overlay defines how the bot behaves in a particular job. A senior litigator is conservative and precedent-driven. A Studio Manager is coordination-focused. A DevOps bot is operational and failure-aware. A Content Bot is creative but must obey publishing gates.

Individual bot variations can exist for human readability, but they should not weaken role rigor. “Lisa is formal” is fine. “Lisa can ignore approval gates” is not.

## Runtime Cores

OpenClaw is the first runtime for high-context, managerial, communication-heavy roles. It provides multi-channel gateway behavior, session loop, persona handling, messaging connectors, and assistant-style interaction. It is suitable for “why” and “what” roles: CEO-like, COO-like, GC-like, creative director, studio manager, account manager.

Agent Zero is more suitable for terminal, coding, CLI, system administration, and technical execution roles. It is suitable for “how” roles: frontend developer, backend developer, DevSecOps, infrastructure worker, resource agent.

Future runtimes can be added through adapters. The platform should not assume all bots run on OpenClaw.

## OpenClaw Fork Strategy

LiNKbot-core can begin as an OpenClaw fork because OpenClaw gives a battle-tested personal assistant skeleton: channels, workspace, persona, tool loop, session management, and local memory patterns.

However, LiNKbot-core should convert OpenClaw into a business runtime shell. Local memory is replaced by LiNKbrain. Local skills are replaced by LinkSkills. Direct secrets are replaced by capability leases and secret managers. Routine workflows are delegated to LiNKautowork. Governance flows through LiNKaios.

Do not over-fork. Keep a clean adapter layer so OpenClaw can be updated or replaced later.

## LiNKbot Adapter Contract

Every runtime adapter should implement a common contract. It should be able to start a session, receive a mission, request context, request a capability, delegate a workflow, emit an event, write a memory candidate, request human approval, pause, resume, and terminate.

This adapter is the runtime abstraction. LiNKaios should not need to understand OpenClaw internals. It should send a governed run request. The adapter translates that request into the runtime’s native shape.

## LiNKbot Work Loop

A typical LiNKbot work loop starts when LiNKaios assigns a mission. The bot requests scoped context from LiNKbrain. LiNKbrain returns relevant memory, policies, incidents, procedures, and project state. The bot reasons over the task. If action is needed, the bot requests a capability lease from LinkSkills. If routine workflow execution exists, LinkSkills routes to LiNKautowork. If the bot must perform a direct reasoning step, it performs it under policy. The bot emits events throughout. At completion, LiNKbrain records outcome and possible lessons.

This makes the bot useful without allowing it to become uncontrolled.

## Integration With LiNKbrain

The bot reads memory through context bundles. It writes events, observations, decisions, and memory candidates. It should not write directly into long-term active memory without governance. It may propose memory. LiNKbrain or a governance process promotes it.

The bot should also retrieve prior incidents and procedures. For example, if a Website Deployment Bot sees a DNS problem, LiNKbrain may return prior incidents and remediation steps.

## Integration With LinkSkills

The bot asks LinkSkills before using capabilities. LinkSkills returns role-approved capabilities and capability leases. The bot never receives the entire toolbox permanently. It receives only what is needed for a task.

This is central to security and cost control.

## Integration With LiNKautowork

The bot delegates repeatable work to LiNKautowork. It should not use reasoning loops for routine tasks when a deterministic workflow exists. This is both a cost and reliability rule.

For example, a Sales Ops Bot may decide that a lead should be onboarded. It requests the client onboarding capability. LinkSkills approves. LiNKautowork creates the CRM record, project folder, task list, intro email draft, and invoice draft.

## Integration With LiNKaios

LiNKaios provisions, routes, monitors, pauses, resumes, retires, and displays bots. The /workers route should show each bot’s role, status, memory scope, skill scope, sessions, cost, current work, model routing, and incidents.

LiNKaios should also provide the human owner with the employee-like UX: hire a bot, assign a role, set cost cap, configure personality overlay, inspect work, approve actions, and retire it.

## Open Source Strategy

Use OpenClaw for multi-channel managerial agent shell. Use Agent Zero for terminal/CLI execution. Use MCP, REST, and SDK adapters to connect to LinkSkills and LiNKbrain. Use LiteLLM/OpenRouter for model routing where appropriate. Use Zulip/Slack/Discord/Telegram/WhatsApp connectors through OpenClaw-style channels as needed. Use Docker for runtime isolation. Use E2B/Daytona for sandboxed code execution if direct execution is necessary.

Do not build a full custom runtime early. The value is in the ecosystem contracts, not a bespoke agent loop.

## Repo Structure

LiNKbot-core should be separate.

A practical structure is:

- `runtimes/openclaw` for the OpenClaw fork/adaptation.
- `runtimes/agent-zero` for the Agent Zero adapter.
- `adapters` for the common runtime contract.
- `gateway` for governed ingress from LiNKaios.
- `personas/baseline` and `personas/overlays`.
- `channels/zulip`, `channels/slack`, `channels/webchat`, and others.
- `sdk` for calls to LiNKbrain, LinkSkills, LiNKautowork, and LiNKaios.
- `docs/runtime-contract`, `docs/persona`, and `docs/session-lifecycle`.

## Moat

A standalone LiNKbot is not enough. The moat is a LiNKbot connected to the rest of the ecosystem. The bot has safe skills, institutional memory, deterministic workflows, role-bound permissions, cost controls, and audit.

For SMBs, the value is easy to understand: the business can hire AI employees into specific roles, and those employees can actually do work safely.

## First Build

Start with two runtime cores. Use OpenClaw for Studio Manager and SEO Analyst in WebsiteFactory. Use Agent Zero later for technical execution. Implement mission ingress, context request, capability lease request, autowork delegation, event emission, and session logging. Do not implement broad runtime support until the contracts are stable.
