# Master plan — LiNKtrend AI Agent Ecosystem MVO

## Purpose of the MVO

Prove an end-to-end **lead → preview site** path using **LinkSites / WebsiteFactory** as the vertical slice, with the ecosystem planes (LiNKaios, LiNKbrain, LinkSkills, LiNKautowork, LiNKbot) wired **without role bleed** per `ARCHITECTURE_RULES.md`.

Success means a credible demo: capture or represent a lead, drive deterministic steps where required, apply governance where side effects exist, emit audit/learn signals to LiNKbrain, and surface a **preview** website artifact suitable for stakeholder review.

## Time targets

- **Conservative plan:** ~**21 days** for a robust, integration-complete slice (see `docs/ecosystem/development-plan/06_Compressed_7_Day_vs_Conservative_21_Day_Plan_v2.md`).
- **Aggressive execution target:** **7 days** for an MVO that may include **documented stubs** rather than full external integrations.

## Current first flow

**LinkSites / WebsiteFactory — lead-to-preview-site**

- Primary user journey: intake a lead (or lead-like input), run the factory pipeline, land on a **preview** publish target appropriate to Day-1 decisions (see `DECISIONS.md`).

## Immediate phase (command center bootstrap)

In order:

1. **Command center + docs verification** — confirm `.ai-swarm/` and `docs/ecosystem/` are the operating sources of truth (`WP-000`).
2. **Repo inventory + reuse map** — identify existing services, packages, and prior art to reuse (`WP-001`).
3. **Day-1 decision freeze** — close or explicitly stub the minimum set of platform choices (`WP-002`).
4. **LiNKaios kernel/module manifest using WebsiteFactory** — define the minimum LiNKaios module contract and use WebsiteFactory as the first module example (`WP-003`).
5. **MVO contracts** — cross-service interfaces, events, and failure modes for the lead-to-preview path, bound to the WP-003 kernel/plugin manifest (`WP-004`).

## Reference documentation

Authoritative narratives and execution planning live under:

- **Architecture ownership:** `docs/architecture/repo-architecture-target.md`
- **System completion targets:** `docs/architecture/system-completion-targets.md`
- **Design:** `docs/ecosystem/design/`
- **Development plan:** `docs/ecosystem/development-plan/`

Legacy pre-ecosystem material is **read-only context** under `docs/archive/legacy-pre-ecosystem/` — do not treat it as the current contract unless reconciled into ecosystem docs or `DECISIONS.md`.
