# LiNKbot

LiNKbot is the role-bound AI employee runtime plane for the LiNKtrend ecosystem.

## Purpose

LiNKbot provides runtime adapters for bot engines (OpenClaw first, then Agent Zero, Agent Hermes), role definitions, fleet/session management, and mission-aware communication profiles.

## Architecture

```
LiNKbot/
├── README.md                          # This file
├── runtime-adapters/                  # Engine-specific runtime adapters
│   └── openclaw/                      # OpenClaw engine adapter
│       ├── bot-runtime/               # Core bot runtime package
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   ├── src/
│       │   │   ├── index.ts           # Main exports
│       │   │   ├── types.ts           # Runtime type definitions
│       │   │   ├── session.ts         # Session lifecycle management
│       │   │   ├── mission.ts         # Mission payload handling
│       │   │   ├── adapter.ts         # OpenClaw adapter contracts
│       │   │   ├── lease-adapter.ts   # LinkSkills lease integration
│       │   │   ├── context-adapter.ts # LiNKbrain context handoff
│       │   │   └── audit-emitter.ts   # Audit event emission
│       │   └── tests/
│       │       ├── adapter.test.ts
│       │       ├── session.test.ts
│       │       └── mission.test.ts
│       └── openclaw-shim/             # OpenClaw compatibility shim
│           ├── package.json
│           ├── tsconfig.json
│           └── src/
│               └── index.ts
├── communications/                  # Communication profiles and gateways
│   └── temporary-gateways/            # Temporary channel gaps
│       └── zulip/                     # Zulip temporary gateway
│           ├── package.json
│           ├── tsconfig.json
│           ├── vitest.config.ts
│           └── src/
│               ├── index.ts
│               ├── types.ts
│               ├── gateway-dispatch.ts
│               ├── resolve-mission-id.ts
│               ├── zulip-payload.ts
│               └── zulip-send.ts
│           └── tests/
│               ├── gateway-dispatch.test.ts
│               └── zulip-payload.test.ts
└── roles/                             # Role definitions
    ├── shared/                        # Cross-module shared roles
    │   ├── README.md
    │   ├── operator-assistant.yaml
    │   └── system-monitor.yaml
    └── modules/                       # Module-specific roles
        ├── linksites/                 # LinkSites/WebsiteFactory roles
        │   ├── README.md
        │   ├── lead-scout-bot.yaml
        │   ├── research-enrichment-bot.yaml
        │   ├── website-builder-bot.yaml
        │   └── outreach-bot.yaml
        └── lexos/                     # LEXOS Litigation roles
            └── README.md
```

## Ownership Boundaries

Per `docs/architecture/repo-architecture-target.md` and `.cursor/rules/01-ecosystem-boundaries.mdc`:

- **LiNKbot DOES own:**
  - Runtime adapters for bot engines
  - Role definitions (shared and module-specific)
  - Fleet/deployment/session ownership docs
  - Engine-specific identity/persona/soul packaging
  - Bot communication profiles and mission context mapping
  - Temporary gateway gaps (Zulip until native engine support)

- **LiNKbot DOES NOT own:**
  - Canonical memory (LiNKbrain owns this)
  - Capability leases or skills governance (LinkSkills owns this)
  - Secrets lifecycle (LinkSkills owns this)
  - Deterministic workflow state (LiNKautowork owns this)
  - Final audit storage (LiNKbrain owns this)
  - Native channel implementations (stay in bot engine forks)

## Runtime Adapter Contract

The OpenClaw runtime adapter provides:

1. **Mission/Session Reception:** Receives `BotReasonRequest` from LiNKaios kernel
2. **Role/Fleet Resolution:** Maps `role_id` to role configuration
3. **Lease Adapter:** Requests capability leases through LinkSkills
4. **Context Adapter:** Requests context from LiNKbrain
5. **Audit Emission:** Emits events to LiNKbrain audit envelope
6. **Deterministic Handoff:** Delegates workflow steps to LiNKautowork

## Role Definitions

Roles are engine-agnostic declarations that include:

- Purpose and responsibilities
- Allowed modules
- Allowed capability connectors
- Allowed skills and tools
- Memory/context rules
- Approval requirements
- Model/runtime profile
- LiNKguard cleanup/security profile
- Channel permissions
- Emitted audit events

## Zulip Temporary Gateway

The Zulip gateway is a **temporary** communication gap filler until OpenClaw (or another engine) adopts native Zulip support. It:

- Routes run notifications to Zulip
- Provides mock/shadow messaging (no live sends in MVO)
- Is mission-aware (carries tenant, mission, role context)
- Does NOT become generic capability ownership

Per `CONTRACTS_MVO.md` §0.A.5, Zulip capability contract:
- Operations: `run.notify`, `channel.message.mock_send`, `connectivity.probe`
- Modes: `mock` default, `shadow` for connectivity, `live` disabled
- All messaging routes through `cap.zulip.run_messaging` lease-gated

## Development Mode

Default execution mode is `development` (local/mock side effects). No live messaging without explicit lease approval.

## License

Proprietary - LiNKtrend Systems
