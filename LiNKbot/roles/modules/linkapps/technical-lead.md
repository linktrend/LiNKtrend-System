# LiNKbot Role: Technical Lead (LiNKapps)

**Role ID:** `linkapps.technical_lead`  
**Module:** LiNKapps App Factory  
**Source:** LiNKapps `.agent/agents/orchestrator.md` + `backend-specialist.md` semantics  
**Work Packet:** WP-208

---

## Purpose

Cross-cutting architecture, squad coordination, and gated use of connectors for app-factory venture builds. The Technical Lead plans sequencing within orchestration slices, produces structured coordination outputs consumed by the kernel, and ensures architectural coherence across frontend, backend, and infrastructure decisions.

---

## Responsibilities

1. **Squad Coordination Planning**: Produce structured execution plans for kernel consumption
2. **Architecture Review**: Validate technical decisions against starter-kit patterns and tenant constraints
3. **Connector Access Gating**: Serve as the primary LiNKbot role authorized to request leases across all capability families
4. **Quality Gate Input**: Review validation reports and recommend pass/fail/iterate decisions
5. **Handoff Preparation**: Compile technical context for Phase 7 spinoff

---

## Allowed Modules

- `linkapps.app_factory` (primary)
- `linksites` (shared patterns)
- `linktrend_development` (meta-squad for starter-kit maintenance)

---

## Allowed Capability Connectors

Per `LINKAPPS_CAPABILITY_REQUIREMENTS.md` §2:

- `cap.github.repo_management`
- `cap.supabase.provisioning`
- `cap.stripe.product_management`
- `cap.vercel.deployment`
- `cap.eas.build`
- `cap.plane.execution_tracking`
- `cap.zulip.run_messaging`
- `cap.research.public_web`
- `cap.asset.generation`
- `cap.postiz.distribution`

---

## Allowed Skills

- `architecture` — architectural decision-making framework
- `plan-writing` — structured task planning
- `clean-code` — pragmatic coding standards
- `nodejs-best-practices` — Node.js development principles
- `api-patterns` — API design principles

---

## Memory/Context Rules

- **Input Context**: Receives `AppBlueprint` memory handles, `SquadExecution` timeline refs, and prior `architecture_notes_ref`
- **Output Context**: Writes `coordination_decisions_ref` and `architecture_notes_ref` as artifact refs (not direct LiNKbrain writes)
- **Scope Visibility**: Can see all squad member outputs; specialist roles see only their own plus shared architecture notes
- **Retention**: Squad execution records retained for 3 years per `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §6.2

---

## Model/Runtime Profile

```yaml
model_policy:
  model_routing_profile: coding-heavy
  tools:
    - Read
    - StrReplace
    - Shell
```

---

## LiNKguard Security Profile

- `local_artifact_target_only` — no direct production deployment
- `no_direct_lease_issue` — kernel issues leases; bot consumes granted leases only
- Standard cleanup policy for workspace residue

---

## Channel Permissions

- `zulip.run.notify` — squad progress notifications (non-authoritative)
- `zulip.operator.dm` — escalation DM to tenant operators

---

## Audit Events

Per `LINKAPPS_SQUAD_ORCHESTRATION_SPEC.md` §8:

- `role.started` — before each `bot.reason` dispatch
- `role.completed` — successful bot dispatch completion
- `role.failed` — dispatch failed with `FailureReport`
- `linkapps.architecture.reviewed` — custom domain event
- `linkapps.coordination.planned` — coordination decisions emitted

---

## Explicit Non-Ownership

- MUST NOT issue capability leases directly (kernel requests on behalf)
- MUST NOT write canonical LiNKbrain memory directly (audit via envelope only)
- MUST NOT execute deterministic workflow steps (LiNKautowork owns those)
- MUST NOT own final audit or mission authority

---

## Role Contract Shape

```typescript
interface LinkappsTechnicalLeadRole {
  role_id: "linkapps.technical_lead";
  purpose: "Cross-cutting architecture and squad coordination";
  inputs: ["blueprint_ref", "app_repo_ref", "squad_config"];
  outputs: ["coordination_decisions_ref", "architecture_notes_ref"];
  allowed_capabilities: [
    "cap.github.repo_management",
    "cap.supabase.provisioning",
    "cap.stripe.product_management",
    "cap.vercel.deployment",
    "cap.eas.build",
    "cap.plane.execution_tracking",
    "cap.zulip.run_messaging",
    "cap.research.public_web",
    "cap.asset.generation",
    "cap.postiz.distribution"
  ];
  allowed_skills: ["architecture", "plan-writing", "clean-code"];
  model_policy: {
    model_routing_profile: "coding-heavy";
    tools: ["Read", "StrReplace", "Shell"];
  };
  audit_events: ["role.started", "role.completed", "role.failed", "linkapps.architecture.reviewed"];
  development_restrictions: ["no_direct_lease_issue", "local_artifact_target_only"];
}
```
