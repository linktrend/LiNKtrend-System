# LiNKtrend System Completion Targets

This document defines the intended completed state for each core system and module family. It is the guardrail for future development waves after the repo architecture cleanup.

## Completion Standard

"90-95% complete" means the system is operational enough that remaining work is mostly UI polish, production hardening, extra connectors, and human UX review. It does not mean every future module, connector, or enterprise feature is finished.

## LiNKaios

**Purpose:** Organizational execution cockpit and control plane.

**Completed state:** Operators can see tenants, enabled modules, LiNKbots, work requests, approvals, traces, capability leases, workflow runs, memory/audit status, and deployment health in one cockpit. LiNKaios coordinates work but does not absorb peer-system responsibilities.

**To reach 90-95%:**

- Finish operational cockpit views for runs, traces, approvals, LiNKbot sessions, connector status, workflow status, and LiNKbrain memory/audit visibility.
- Make module activation explicit per tenant.
- Keep route/API ownership under `LiNKaios/` while `LiNKaios/linkaios-web` remains the deployable entrypoint.

## LiNKbrain

**Purpose:** Institutional memory, audit, context assembly, retrieval, and learning plane.

**Completed state:** Every meaningful side effect, reasoning step, workflow run, approval, failure, and governance decision writes a canonical audit envelope. Memory objects are derived from events, scoped by tenant/module/role, retrievable through context bundles, and visible to operators.

**To reach 90-95%:**

- Complete event-to-memory object promotion for leads, research bundles, episodes, incidents, and procedures.
- Finish context assembly with scope lattice enforcement.
- Add pgvector-backed semantic retrieval and benchmark/feedback loops.
- Keep current compatibility code mapped in `LiNKbrain/source-map.md` until extraction is safe.

## LinkSkills

**Purpose:** Capability governance, leases, connector catalog, skills, tools, idempotency, approvals, and kill switches.

**Completed state:** All capabilities used by modules are declared as capability connectors, lease-gated, mode-aware (`mock`, `shadow`, `live`), auditable, idempotent, and discoverable. Skills and tools are governed separately from connectors.

**To reach 90-95%:**

- Complete connector manifests under `LiNKskills/capability-connectors/` for approved external forks and providers.
- Finish lease lifecycle, execute ledger, idempotency, kill switch, approval handoff, and connector readiness checks.
- Keep live side effects disabled unless explicitly approved.

## LiNKautowork

**Purpose:** Deterministic workflow execution plane and gateway to the external n8n fork.

**Completed state:** Repeatable business steps run through deterministic workflow templates with idempotency, retry/backoff, audit, status visibility, and clear promotion from development to shadow/live modes.

**To reach 90-95%:**

- Complete workflow template registry, run controller, retry/idempotency, operator controls, and health metrics.
- Wire LinkSites, LEXOS, and LiNKapps deterministic workflow packs through the gateway.
- Keep the full n8n fork external at `/Users/linktrend/Projects/LiNKautowork`.

## LiNKbot

**Purpose:** Role-bound AI employee runtime plane.

**Completed state:** LiNKbots can be provisioned into shared or module-specific roles, receive missions, request LiNKbrain context, request LinkSkills leases, delegate deterministic work to LiNKautowork, emit audit events, and run through runtime adapters such as OpenClaw first and Agent Zero/Agent Hermes later.

**To reach 90-95%:**

- Finish OpenClaw runtime adapter, session lifecycle, mission payload, context request, lease request, audit/provenance emits, and channel profile docs.
- Add role packs under `LiNKbot/roles/shared/` and `LiNKbot/roles/modules/`.
- Keep engine-native channel implementations in the engine fork; this repo owns mission routing, channel profiles, audit mapping, and temporary gaps.

## LiNKguard

**Purpose:** Worker security and cleanup sidecar.

**Completed state:** Worker sessions have cleanup/residue policy, filesystem safety, heartbeat/retention, dry-run and live cleanup modes, audit hooks, and operator visibility. LiNKguard protects runtime environments but does not own memory, skills, or mission authority.

**To reach 90-95%:**

- Finish residue cleanup policy, runtime guard profiles, audit hooks, and operator status.
- Preserve legacy package name only where build/deploy compatibility requires it.

## LinkSites

**Purpose:** WebsiteFactory lead-to-preview-site module and first MVO.

**Completed state:** A lead moves through research, website package generation, artifact storage, Supabase mirror, Payload sync, preview readiness checks, CRM status update, Plane tracking, audit, and trace visibility.

**To reach 90-95%:**

- Complete live local Supabase/Payload proof.
- Finish preview UI checks and human UX review.
- Keep future work focused on additional templates, content quality, and media assets after plumbing is complete.

## LEXOS

**Purpose:** Legal operations module family; litigation is the first active practice area.

**Completed state:** LEXOS Litigation runs through its declared W0-W11 workflow spine with UI surfaces, adapted schemas, deterministic workflow hooks, LiNKbot roles, LinkSkills connectors, and LiNKbrain audit/memory events.

**To reach 90-95%:**

- Finish integration of existing LEXOS workflows from `/Users/linktrend/Projects/LiNKtrend-LEXOS`.
- Complete litigation UI route wiring, schema use, workflow hooks, and role packs.
- Reserve other practice areas until explicitly specified.

## LiNKapps

**Purpose:** App factory module for venture software creation.

**Completed state:** LiNKapps can take a venture blueprint/PRD through squad formation, repository generation, deterministic setup, build validation, deployment preparation, trace visibility, and handoff artifacts.

**To reach 90-95%:**

- Wire the starter kit and workflow pack from `/Users/linktrend/Projects/LiNKapps`.
- Complete sidebar/trace integration, module route registration, role pack, and connector requirements.

## Linktrend Media

**Purpose:** Planned content and marketing production module.

**Completed state:** The module coordinates content planning, generation, review, scheduling, distribution, analytics, and feedback through governed connectors.

**To reach 90-95%:**

- Define the first workflow spine before implementation.
- Likely connectors include Postiz, Listmonk, Typebot, Umami, SerpBear, Chatwoot, asset generation, public research, Plane, Zulip, Supabase, and Odoo CRM.

## Repo Drift Rule

Before adding code, agents must identify the owning system from this document and then place files according to `docs/architecture/repo-architecture-target.md`. If the correct owner is unclear, stop and ask.
