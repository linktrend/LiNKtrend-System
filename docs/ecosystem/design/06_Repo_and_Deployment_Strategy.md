# LiNKtrend Platform Repo and Deployment Strategy

## Purpose

This document gives the engineering mental picture for how the LiNKtrend ecosystem should be developed. The recommended structure is not one giant monorepo and not dozens of tiny repos from day one. The recommended model is one LiNKaios monorepo plus separate peer service repositories for LiNKbrain, LinkSkills, LiNKautowork, and LiNKbot-core.

Current repo ownership and completed-state targets supersede older folder examples in this narrative. Use `docs/architecture/repo-architecture-target.md` and `docs/architecture/system-completion-targets.md` for new work.

This matches the architecture. LiNKaios is the main operating system and plugin host. The other systems are independent services with their own databases, workers, APIs, and deployment needs.

## High-Level Repo Layout

The platform should be organized as:

- `linkaios` monorepo
- `linkbrain` repo
- `linkskills` repo
- `linkautowork` repo
- `linkbot-core` repo
- optional later `linkcontracts` repo
- optional later separate plugin repos

The LiNKaios monorepo contains the kernel, dashboard, plugin runtime, vertical plugins, capability plugin definitions, shared UI, and internal SDK clients. The peer repos contain services that LiNKaios consumes through APIs.

## Why Not One Giant Monorepo

One giant monorepo would be convenient at first but dangerous later. LiNKbrain, LinkSkills, LiNKautowork, and LiNKbot-core have different runtime profiles. LiNKbrain has memory workers, retrieval, context assembly, event ingestion, and privacy logic. LinkSkills has policy, capability leases, certification, and run ledgers. LiNKautowork has n8n, workflow templates, gateway, and test harnesses. LiNKbot-core has OpenClaw/Agent Zero runtime code and channel connectors.

Putting all of this into one repo would make deployment, ownership, testing, and scaling harder. It would also encourage boundary confusion.

## Why Not Too Many Repos

Splitting every plugin, adapter, and UI surface into separate repos too early would slow development. Early architecture will change. Plugin contracts will evolve. Shared UI will change. Contracts will be revised. Keeping vertical and capability plugins inside the LiNKaios monorepo allows fast refactoring.

A plugin should move to a separate repo only when it has a separate commercial lifecycle, third-party maintainer, large codebase, separate licensing, or dedicated team.

## LiNKaios Monorepo

The LiNKaios monorepo should contain the operating system surface.

Suggested structure:

```text
linkaios/
  apps/
    linkaios-web/
    admin-console/
  packages/
    ui/
    config/
    contracts/
    plugin-runtime/
    sdk-linkbrain/
    sdk-linkskills/
    sdk-linkautowork/
    sdk-linkbot/
  plugins/
    verticals/
      websitefactory/
      venturestudio/
      mediaproduction/
      ecommerce/
      lawfirm-litigation/
    capabilities/
      accounting/
      crm/
      doc-management/
      project-management/
      messaging/
      social-publishing/
      analytics/
      email/
      payments/
      storefront/
  db/
    migrations/
    seed/
  docs/
    architecture/
    plugin-contracts/
    implementation/
    work-packets/
  tools/
    plugin-validator/
    manifest-validator/
    seed-generator/
```

Vertical plugin folders should include manifests, roles, workflows, memory schemas, skill bindings, capability requirements, UI, migrations, and templates.

Capability plugin folders should include capability manifest, operations, adapter definitions, settings UI, and contract tests.

## LiNKbrain Repo

Suggested structure:

```text
linkbrain/
  services/
    api/
    workers/
    context-assembler/
    privacy/
  db/
    migrations/
    schemas/
  packages/
    linkbrain-ts/
    linkbrain-py/
  schemas/
    events/
    memory-objects/
    context-bundles/
  tests/
    retrieval/
    context-assembly/
    privacy/
  docs/
    architecture/
    memory-governance/
    evals/
```

LiNKbrain owns event ledger, memory objects, context assembly, retrieval, benchmark intelligence, and memory governance.

## LinkSkills Repo

Suggested structure:

```text
linkskills/
  services/
    api/
    policy-worker/
    curator/
    evaluator/
  skills/
    skill-template/
    certified-skills/
  policies/
    opa/
  db/
    migrations/
    schemas/
  packages/
    linkskills-ts/
    linkskills-py/
  tests/
    policy/
    disclosure/
    certification/
  docs/
    capability-contracts/
    certification/
    policies/
```

LinkSkills owns capability catalog, policy, disclosure broker, capability leases, idempotency, run ledger, certification, and Curator recommendations.

## LiNKautowork Repo

Suggested structure:

```text
linkautowork/
  gateway/
  n8n/
    docker-compose.yml
    config/
  automations/
    templates/
    live/
      dev/
      prod/
    tests/
  db/
    audit-schema/
  packages/
    linkautowork-ts/
    linkautowork-py/
  tools/
    export-live-workflows/
    validate-workflow/
  docs/
    workflow-authoring/
    gateway-security/
    promotion/
```

LiNKautowork owns n8n gateway, workflow templates, live workflow snapshots, dirty-data tests, workflow audit, and promotion evidence.

## LiNKbot-Core Repo

Suggested structure:

```text
linkbot-core/
  runtimes/
    openclaw/
    agent-zero/
  adapters/
  gateway/
  personas/
    baseline/
    overlays/
  channels/
    zulip/
    slack/
    webchat/
  sdk/
  docs/
    runtime-contract/
    persona/
    session-lifecycle/
```

LiNKbot-core owns runtime adapters, persona overlays, channels, session handling, and governed ingress from LiNKaios.

## Shared Contracts

Early on, shared contracts can live in `linkaios/packages/contracts`. These include tenant contract, bot contract, role contract, plugin manifest schema, capability manifest schema, memory event schema, workflow event schema, audit event schema, and context bundle schema.

Once contracts stabilize, create a separate `linkcontracts` repo. That repo can generate TypeScript and Python packages consumed by all services.

Do not split contracts too early. The contracts will change frequently during the first proof-of-loop implementation.

## Development Order

The recommended build order is:

1. LiNKaios skeleton: tenant model, plugin loader, vertical plugin skeleton, capability plugin skeleton, dashboard shell, LiNKbot registry, shared UI, service SDK stubs.
2. LinkSkills minimal: capability catalog, policy check, capability lease, run ledger, idempotency, one or two capabilities.
3. LiNKbrain minimal: event ledger, memory objects, context assembly endpoint, audit lookup.
4. LiNKautowork minimal: n8n instance, signed gateway, one workflow template, audit writeback.
5. LiNKbot adapter: OpenClaw adapter, mission ingress, context request, capability request, autowork delegation.
6. WebsiteFactory vertical: first complete product loop.

Do not start by building all verticals.

## Deployment Pattern

Default MVO deployment:

- LiNKaios web on Vercel or self-hosted Node.
- Peer services on DigitalOcean App Platform or droplets.
- Supabase Cloud for databases.
- Docker Compose for open-source systems.
- Tailscale for private access.
- Traefik for reverse proxy.
- GHCR for container images.
- Separate service databases or Supabase projects where useful.

Dedicated deployment later:

- per-tenant databases
- per-tenant LiNKbrain/LinkSkills/LiNKautowork
- private cloud or customer cloud
- isolated n8n and business stack
- stronger data residency controls

## Branching and AI Development

Use predictable branch naming. For example:

- `dev/cursor`
- `dev/codex`
- `dev/minicursor`
- `dev/minicodex`
- `feature/linkbrain-event-ledger`
- `feature/linkskills-disclosure-broker`
- `feature/websitefactory-mvp`

Each repo should maintain:

- `PROJECT_STATE.md`
- `AGENT_HANDOFF.md`
- `WORK_PACKET_REGISTER.md`
- `.env.example`
- repo-specific Cursor rules
- architecture docs
- implementation docs

This keeps AI-assisted development controlled.

## Final Recommendation

Use the LiNKaios monorepo as the primary system-building space. Keep the peer services separate. Keep plugins inside LiNKaios until contracts stabilize. Build the WebsiteFactory proof loop first. Create `linkcontracts` later when the APIs and schemas stop moving.

The mental model is a main office and four specialized departments. LiNKaios is the office. LiNKbrain is records and memory. LinkSkills is permissions and capabilities. LiNKautowork is automation. LiNKbot-core is the workforce runtime.
