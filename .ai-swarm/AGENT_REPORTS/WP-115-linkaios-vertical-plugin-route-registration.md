# WP-115 Agent Report - LiNKaios Vertical Plugin Route Registration

**Agent**: Kimi (discovery/specification)
**Work Packet**: WP-115-linkaios-vertical-plugin-route-registration
**Branch**: dev/kimi/WP-115-linkaios-vertical-plugin-route-registration
**Status**: COMPLETED

## Summary

Created the LiNKaios vertical plugin route registration contract and kernel extension specification. This work defines how vertical plugins (LinkSites, LEXOS, LiNKapps) register UI routes, API endpoints, and navigation items with the LiNKaios kernel.

## Files Changed

### New Documentation Files

1. `.ai-swarm/docs/vertical-plugin-route-contract.md`
   - Route registration contract defining TypeScript interfaces
   - Route kinds: navigation, resource, api
   - Path patterns for each vertical plugin type
   - Permission binding and mode-aware routing
   - Collision prevention rules

2. `.ai-swarm/docs/kernel-vertical-route-extension.md`
   - Kernel extension specification for route registry
   - Data flow diagrams
   - Module architecture (Route Registry, Navigation Store, Permission Adapter)
   - API and UI route structure conventions
   - Audit integration and error handling
   - Implementation phases

3. `.ai-swarm/docs/vertical-plugin-navigation-spec.md`
   - UI navigation specification for shell integration
   - Navigation item types and hierarchy
   - Dashboard layout structure
   - Contextual actions and recent resources
   - Responsive behavior and accessibility

4. `.ai-swarm/docs/vertical-plugin-route-examples.md`
   - Reference implementation examples
   - LinkSites / WebsiteFactory routes
   - LEXOS Litigation routes (mode-aware)
   - LiNKapps routes
   - Route registry implementation sketch
   - Navigation store implementation sketch

## Key Design Decisions

### 1. Route Kinds

Three kinds of routes are defined:
- **navigation**: Top-level shell navigation entries (`/linksites`, `/lexos`)
- **resource**: Resource-specific nested routes (`/v/linksites/sites/:siteId`)
- **api**: API-only endpoints (`/api/v1/verticals/linksites/sites`)

### 2. Path Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Dashboard | `/${plugin_id}` | `/linksites` |
| Resource | `/v/${plugin_id}/${resource}/:id` | `/v/lexos/matters/:matterId` |
| API | `/api/v1/verticals/${plugin_id}/${resource}` | `/api/v1/verticals/linksites/sites` |

### 3. Permission Binding

Routes declare `required_permissions` array. The kernel validates permissions via LinkSkills at route access time. Navigation items are filtered based on user permissions.

### 4. Mode-Aware Routing

Per DECISIONS.md D-084-B (LEXOS mode restrictions), routes can declare `available_in_modes: ["development" | "shadow" | "live"]`. Example: LEXOS court filing routes only available in `live` mode.

### 5. Collision Prevention

Route paths are validated at registration time:
- No two routes may have identical paths
- System routes (`/api`, `/work`, `/settings`) take precedence
- Plugin isolation via `plugin_id` namespacing
- Collision resolution: first-registered wins, later fails with `MANIFEST_ROUTE_COLLISION`

## Route Pattern Table

| Plugin | Route ID | Kind | Path |
|--------|----------|------|------|
| LinkSites | linksites.navigation.dashboard | navigation | `/linksites` |
| LinkSites | linksites.resource.sites | resource | `/v/linksites/sites/:siteId` |
| LinkSites | linksites.resource.generations | resource | `/v/linksites/sites/:siteId/generations/:generationId` |
| LEXOS | lexos.navigation.dashboard | navigation | `/lexos` |
| LEXOS | lexos.resource.matters | resource | `/v/lexos/matters/:matterId` |
| LEXOS | lexos.resource.evidence | resource | `/v/lexos/matters/:matterId/evidence/:evidenceId` |
| LEXOS | lexos.resource.court_filing | resource | `/v/lexos/matters/:matterId/filings/:filingId` (live only) |
| LiNKapps | linkapps.navigation.dashboard | navigation | `/linkapps` |
| LiNKapps | linkapps.resource.projects | resource | `/v/linkapps/projects/:projectId` |

## Files to Create in Future Implementation

### New Kernel Files
- `apps/linkaios-web/src/lib/kernel/route-registry.ts`
- `apps/linkaios-web/src/lib/kernel/navigation-store.ts`
- `apps/linkaios-web/src/lib/kernel/permission-adapter.ts`

### New API Routes
- `apps/linkaios-web/src/app/api/v1/verticals/[plugin_id]/route.ts`

### New UI Routes
- `apps/linkaios-web/src/app/(shell)/work/[plugin_id]/page.tsx`
- `apps/linkaios-web/src/app/(shell)/v/[plugin_id]/[...path]/page.tsx`

### Modified Files
- `apps/linkaios-web/src/lib/kernel/manifest-loader.ts` (add route extraction)
- `apps/linkaios-web/src/middleware.ts` (add route resolution)
- `packages/linklogic-sdk/types/plugin.ts` (add route types)

## Ecosystem Boundaries Observed

- **LiNKaios coordinates, does not absorb**: Kernel owns route registry and navigation state, but does not implement plugin UI or capability execution
- **LinkSkills owns permissions**: Kernel checks permissions, does not define policy
- **LiNKautowork owns workflows**: API routes delegate to capability plugins and workflows
- **LinkBots own reasoning**: UI routes render plugin-specific panels
- **LiNKbrain owns audit**: All route access emits audit events

## Audit Events Defined

| Event | Trigger |
|-------|---------|
| `route.registered` | Plugin manifest loaded |
| `route.unregistered` | Plugin disabled |
| `route.accessed` | User navigates to route |
| `route.access_denied` | Permission check fails |
| `route.collision_detected` | Path collision at registration |
| `navigation.item_clicked` | User clicks nav item |
| `navigation.contextual_action` | Contextual action triggered |

## Next Steps

1. **WP-115-impl**: Implement route registry module
2. **WP-115-nav**: Implement navigation store integration
3. **WP-115-api**: Create API route handlers for verticals
4. **WP-115-ui**: Create dashboard and resource pages
5. **WP-115-linkskills**: Integrate permission checks with LinkSkills

## Proof

- [x] Document listing all deliverables: 4 specification documents created
- [x] Contract examples for each vertical plugin type: LinkSites, LEXOS, LiNKapps
- [x] Route pattern table: Complete mapping table provided
- [x] No code changes to existing plugins: Only documentation/specs created

## Blockers

None.

## Time

Completed in single session.

---

**Report Date**: 2026-05-17
**Commit SHA**: (to be filled after commit)
