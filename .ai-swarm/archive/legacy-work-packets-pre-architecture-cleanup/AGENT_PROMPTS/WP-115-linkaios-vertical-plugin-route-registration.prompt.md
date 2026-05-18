# WP-115 Agent Prompt - LiNKaios Vertical Plugin Route Registration

Use Kimi for this packet. This is a discovery and specification task requiring careful analysis of existing patterns.

## Clean Worktree Requirement

Use a separate clean worktree/checkout for this packet. Do not run this packet in a shared dirty repo folder.

```bash
cd /Users/linktrend/Projects/LiNKtrend-System
git fetch origin --prune
git worktree add ../LiNKtrend-System-WP-115 -b dev/kimi/WP-115-linkaios-vertical-plugin-route-registration origin/development
cd ../LiNKtrend-System-WP-115
git status --short --branch
```

If unrelated dirty files exist, stop before editing and report the blocker.

## Required Reading

- `.cursor/rules/00-linktrend-master-rule.mdc`
- `.cursor/rules/01-ecosystem-boundaries.mdc`
- `.cursor/rules/03-agent-swarm-coordination.mdc`
- `.ai-swarm/CONTRACTS_MVO.md`
- `.ai-swarm/DECISIONS.md` (especially D-084-A, D-084-B, D-094-A for LEXOS context)
- `LiNKaios/linkaios-web/src/lib/kernel/manifest-loader.ts`
- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/manifest.ts`
- `LiNKaios/linkaios-web/src/lib/plugins/websitefactory/index.ts`
- `LiNKautowork/gateway/src/workflows/index.ts` (workflow bootstrap pattern)
- `LiNKtrend-LEXOS/` vertical plugin structure (if accessible)

## Mission

Create the LiNKaios vertical plugin route registration system that exposes vertical plugin routes/paths in the kernel UI and API surface.

Vertical plugins to support:
1. **LinkSites / WebsiteFactory** (existing reference implementation)
2. **LEXOS Litigation** (conversion in progress per WP-084, WP-094, WP-104, WP-105)
3. **LiNKapps** (future vertical, per WP-085)

## Scope

1. **Plugin Route Registry**: Design and document the route registration contract for vertical plugins
2. **Kernel Extension**: Add vertical plugin route loading to the LiNKaios kernel manifest loader
3. **API Routes**: Define Next.js API route structure for vertical plugin operations
4. **UI Navigation**: Define shell navigation registration for vertical plugins

## Hard Boundaries

- NO changes to LinkSites/WebsiteFactory plugin implementation (reference only)
- NO LiNKautowork workflow implementation (out of scope)
- NO LiNKbot role contracts (handled in WP-104)
- NO database schema changes (use existing plugin table)
- NO live LEXOS/LinkApps code migration (discovery/spec only)

## Deliverables

1. **Route Registration Contract** (`docs/vertical-plugin-route-contract.md`):
   - Route path patterns (e.g., `/v/{plugin_id}/{resource}`)
   - Registration interface/types
   - Permission/scope binding

2. **Kernel Extension Specification** (`docs/kernel-vertical-route-extension.md`):
   - How manifest loader discovers vertical routes
   - Route-to-plugin mapping
   - Runtime route resolution

3. **API Route Structure** (documented in spec):
   - RESTful patterns for vertical operations
   - WebSocket endpoints for real-time vertical updates
   - Route parameter binding

4. **UI Navigation Spec** (`docs/vertical-plugin-navigation-spec.md`):
   - Shell navigation registration
   - Vertical plugin menu items
   - Context-aware navigation

5. **Reference Implementation Sketch**:
   - Example route registration for WebsiteFactory (documentation only)
   - Example LEXOS route structure (documentation only)

## Proof Required

- Document listing all deliverables
- Contract examples for each vertical plugin type
- Route pattern table showing plugin_id → route_prefix mapping
- Update `.ai-swarm/AGENT_REPORTS/WP-115-linkaios-vertical-plugin-route-registration.md`

## Finish

Commit message: `docs: vertical plugin route registration contract and kernel extension spec`
Push branch to GitHub.
