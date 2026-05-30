# Vertical Plugin Route Registration Contract

LiNKaios kernel extension for registering UI routes and API paths from vertical plugins.

Per CONTRACTS_MVO.md §1.5, WP-040 (Plugin Architecture v2), and DECISIONS.md D-084-A (LEXOS vertical plugin).

## 1. Purpose

This contract defines how vertical plugins register routes for:
- UI navigation paths (shell navigation, menu items)
- API endpoints (RESTful operations, WebSocket subscriptions)
- Resource-specific sub-routes (nested paths for vertical resources)

## 2. Route Kinds

Vertical plugins may register three kinds of routes:

| Kind | Purpose | Example |
|------|---------|---------|
| `navigation` | Top-level shell navigation entries | `/work`, `/projects`, `/lexos` |
| `resource` | Resource-specific nested routes | `/v/linksites/sites/:siteId`, `/v/lexos/matters/:matterId` |
| `api` | API-only endpoints (no UI) | `/api/v1/verticals/linksites/sites` |

## 3. Route Registration Interface

### 3.1 TypeScript Interface

```typescript
interface VerticalPluginRoute {
  /** Route identifier: `${plugin_id}.${route_kind}.${route_name}` */
  route_id: string;

  /** Route kind */
  kind: "navigation" | "resource" | "api";

  /** URL path pattern */
  path: string;

  /** HTTP methods (for api routes) or "GET" for UI routes */
  methods: ("GET" | "POST" | "PUT" | "PATCH" | "DELETE")[];

  /** Display metadata (for navigation/resource routes) */
  display?: {
    label: string;
    icon?: string;
    description?: string;
    order?: number;
  };

  /** Required permissions to access this route */
  required_permissions: string[];

  /** Parent route reference (for nested resources) */
  parent_route_id?: string;

  /** Route parameters (path segments starting with :) */
  parameters?: string[];

  /** Associated work request type (if this route triggers work) */
  work_request_type?: string;

  /** Contextual menu items when on this route */
  contextual_actions?: string[];
}

interface VerticalPluginRouteRegistration {
  plugin_id: string;
  version: string;
  routes: VerticalPluginRoute[];
}
```

### 3.2 Route Path Patterns

**Navigation Routes:**
- Pattern: `/${plugin_id}` or `/work/${plugin_id}`
- Convention: Short plugin slug, kebab-case
- Examples:
  - `/linksites` → LinkSites vertical dashboard
  - `/lexos` → LEXOS litigation dashboard
  - `/linkapps` → LiNKapps squad dashboard

**Resource Routes:**
- Pattern: `/v/${plugin_id}/${resource_type}/:${resource_id_param}`
- Convention: Versioned (`/v/`) prefix for resource-scoped routes
- Examples:
  - `/v/linksites/sites/:siteId` → Specific site detail
  - `/v/linksites/sites/:siteId/generations/:generationId` → Specific generation
  - `/v/lexos/matters/:matterId` → Matter detail
  - `/v/lexos/matters/:matterId/evidence/:evidenceId` → Evidence within matter

**API Routes:**
- Pattern: `/api/v1/verticals/${plugin_id}/${resource_type}`
- Convention: RESTful plural nouns, versioned API prefix
- Examples:
  - `/api/v1/verticals/linksites/sites` → List/create sites
  - `/api/v1/verticals/linksites/sites/:siteId` → Get/update/delete site
  - `/api/v1/verticals/lexos/matters/:matterId/evidence` → List matter evidence

## 4. Route Registration Flow

### 4.1 Registration Sequence

```
Plugin Manifest Load (at boot/install)
    ↓
Extract routes[] from manifest.public_surfaces.routes
    ↓
Validate route paths (no collisions, valid patterns)
    ↓
Register with LiNKaios Route Registry
    ↓
Update Navigation Store (for UI routes)
    ↓
Mount API Routes (for api kind)
```

### 4.2 Manifest Extension

The `PluginManifest` in CONTRACTS_MVO.md §1.2 is extended with a `routes` field:

```typescript
interface PluginManifest {
  // ... existing fields from CONTRACTS_MVO.md §1.2 ...

  public_surfaces: {
    work_request_types: string[];
    ui_panels: string[];
    read_views: string[];

    // NEW: Route declarations
    routes?: VerticalPluginRoute[];
  };
}
```

## 5. Vertical Plugin Route Examples

### 5.1 LinkSites / WebsiteFactory Routes

```typescript
const LINKSITES_ROUTES: VerticalPluginRoute[] = [
  // Navigation route
  {
    route_id: "linksites.navigation.dashboard",
    kind: "navigation",
    path: "/linksites",
    methods: ["GET"],
    display: {
      label: "LinkSites",
      icon: "Globe",
      description: "Website factory and preview management",
      order: 10,
    },
    required_permissions: ["linksites.dashboard.read"],
    work_request_type: "websitefactory.lead_to_preview",
  },

  // Resource routes
  {
    route_id: "linksites.resource.sites",
    kind: "resource",
    path: "/v/linksites/sites/:siteId",
    methods: ["GET"],
    display: {
      label: "Site Details",
      order: 20,
    },
    required_permissions: ["linksites.sites.read"],
    parameters: ["siteId"],
  },
  {
    route_id: "linksites.resource.generations",
    kind: "resource",
    path: "/v/linksites/sites/:siteId/generations/:generationId",
    methods: ["GET"],
    display: {
      label: "Generation Details",
    },
    required_permissions: ["linksites.generations.read"],
    parent_route_id: "linksites.resource.sites",
    parameters: ["siteId", "generationId"],
    contextual_actions: ["linksites.generation.preview", "linksites.generation.publish"],
  },

  // API routes
  {
    route_id: "linksites.api.sites_list",
    kind: "api",
    path: "/api/v1/verticals/linksites/sites",
    methods: ["GET", "POST"],
    required_permissions: ["linksites.sites.read", "linksites.sites.write"],
  },
  {
    route_id: "linksites.api.sites_detail",
    kind: "api",
    path: "/api/v1/verticals/linksites/sites/:siteId",
    methods: ["GET", "PATCH", "DELETE"],
    required_permissions: ["linksites.sites.read", "linksites.sites.write"],
    parameters: ["siteId"],
  },
];
```

### 5.2 LEXOS Litigation Routes

```typescript
const LEXOS_ROUTES: VerticalPluginRoute[] = [
  // Navigation route
  {
    route_id: "lexos.navigation.dashboard",
    kind: "navigation",
    path: "/lexos",
    methods: ["GET"],
    display: {
      label: "LEXOS",
      icon: "Scale",
      description: "Litigation management and legal workflows",
      order: 20,
    },
    required_permissions: ["lexos.dashboard.read"],
  },

  // Resource routes
  {
    route_id: "lexos.resource.matters",
    kind: "resource",
    path: "/v/lexos/matters/:matterId",
    methods: ["GET"],
    display: {
      label: "Matter Details",
      order: 10,
    },
    required_permissions: ["lexos.matters.read"],
    parameters: ["matterId"],
  },
  {
    route_id: "lexos.resource.evidence",
    kind: "resource",
    path: "/v/lexos/matters/:matterId/evidence/:evidenceId",
    methods: ["GET"],
    display: {
      label: "Evidence",
    },
    required_permissions: ["lexos.evidence.read"],
    parent_route_id: "lexos.resource.matters",
    parameters: ["matterId", "evidenceId"],
  },
  {
    route_id: "lexos.resource.extractions",
    kind: "resource",
    path: "/v/lexos/matters/:matterId/extractions/:extractionId",
    methods: ["GET"],
    display: {
      label: "Extraction",
    },
    required_permissions: ["lexos.extractions.read"],
    parent_route_id: "lexos.resource.matters",
    parameters: ["matterId", "extractionId"],
  },

  // API routes
  {
    route_id: "lexos.api.matters_list",
    kind: "api",
    path: "/api/v1/verticals/lexos/matters",
    methods: ["GET", "POST"],
    required_permissions: ["lexos.matters.read", "lexos.matters.write"],
  },
  {
    route_id: "lexos.api.evidence_list",
    kind: "api",
    path: "/api/v1/verticals/lexos/matters/:matterId/evidence",
    methods: ["GET", "POST"],
    required_permissions: ["lexos.evidence.read", "lexos.evidence.write"],
    parameters: ["matterId"],
  },
];
```

### 5.3 LiNKapps Routes

```typescript
const LINKAPPS_ROUTES: VerticalPluginRoute[] = [
  // Navigation route
  {
    route_id: "linkapps.navigation.dashboard",
    kind: "navigation",
    path: "/linkapps",
    methods: ["GET"],
    display: {
      label: "LiNKapps",
      icon: "LayoutGrid",
      description: "App squad orchestration and project management",
      order: 30,
    },
    required_permissions: ["linkapps.dashboard.read"],
  },

  // Resource routes
  {
    route_id: "linkapps.resource.projects",
    kind: "resource",
    path: "/v/linkapps/projects/:projectId",
    methods: ["GET"],
    display: {
      label: "Project",
    },
    required_permissions: ["linkapps.projects.read"],
    parameters: ["projectId"],
  },
];
```

## 6. Route Permission Binding

Routes are bound to LinkSkills permissions. The kernel validates permissions at route access time:

```typescript
interface RoutePermissionBinding {
  route_id: string;
  permission_id: string;
  access_level: "read" | "write" | "admin";
}
```

Permission checks are performed:
1. **Navigation**: When rendering shell navigation (hide/show based on permissions)
2. **Resource**: When accessing resource detail pages
3. **API**: On every API request (enforced at edge/API route)

## 7. Route Collision Prevention

### 7.1 Validation Rules

1. **Unique Paths**: No two routes may have identical `path` patterns
2. **Reserved Prefixes**: System routes (`/api`, `/work`, `/settings`, `/health`) take precedence
3. **Plugin Isolation**: Routes are namespaced by `plugin_id` in the path pattern
4. **Version Stability**: Once published, route paths SHOULD NOT change (backward compatibility)

### 7.2 Collision Resolution

If a collision is detected at registration time:
- Earlier-registered route wins (first-come)
- Later route registration fails with `MANIFEST_ROUTE_COLLISION`
- Collision logged to LiNKbrain audit

## 8. Dynamic Route Parameters

### 8.1 Parameter Binding

Route parameters are bound to context and made available to:
- UI components via context
- API handlers via request params
- Workflow invocations via `run_context.route_params`

```typescript
interface RouteContext {
  route_id: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  plugin_id: string;
}
```

### 8.2 Parameter Validation

Parameters SHOULD be validated:
- Format validation (UUID, slug, numeric)
- Existence validation (resource exists, tenant-scoped)
- Permission validation (user has access to specific resource)

## 9. Mode-Aware Routes

Per DECISIONS.md D-084-B, routes MAY be mode-aware:

```typescript
interface ModeAwareRoute extends VerticalPluginRoute {
  /** Modes where this route is available */
  available_in_modes: ("development" | "shadow" | "live")[];

  /** Route behavior per mode */
  mode_behavior?: {
    development?: { /* dev-specific config */ };
    shadow?: { /* shadow-specific config */ };
    live?: { /* live-specific config */ };
  };
}
```

Example: A "file court document" route would only be available in `live` mode for LEXOS.

## 10. Route Lifecycle

### 10.1 Registration Events

| Event | Trigger | Audit Action |
|-------|---------|--------------|
| `route.registered` | Plugin manifest loaded | `plugin.route.registered` |
| `route.updated` | Plugin version updated | `plugin.route.updated` |
| `route.unregistered` | Plugin disabled | `plugin.route.unregistered` |
| `route.access_denied` | Permission check failed | `route.access_denied` |

### 10.2 Runtime Events

| Event | Trigger | Audit Action |
|-------|---------|--------------|
| `route.navigated` | User navigates to route | `route.navigated` |
| `route.resource_loaded` | Resource data fetched | `route.resource_loaded` |
| `route.action_invoked` | Contextual action triggered | `route.action_invoked` |

## 11. Migration from v1 Manifests

Legacy v1 manifests (without `routes` field) receive automatic route generation:

| v1 Field | Generated Route |
|----------|-----------------|
| `plugin_id: "websitefactory"` | `/work/websitefactory` (navigation) |
| `work_request_types[0]` | Resource routes inferred from stages |
| `ui_panels` | Navigation children |

## 12. Non-Goals

Per ecosystem boundaries (ARCHITECTURE_RULES.md §12):

- **Route implementation**: Plugins do not implement routing logic; they declare routes
- **Permission policy**: LinkSkills owns permission grants; kernel only checks them
- **Navigation state**: Kernel owns navigation state management; plugins only declare items
- **API execution**: LiNKautowork and capability plugins own API execution

## 13. Acceptance Criteria

A vertical plugin route registration is complete when:

1. Routes are declared in manifest with valid `route_id`, `kind`, `path`
2. Navigation routes appear in shell UI when user has permissions
3. Resource routes resolve to correct plugin context
4. API routes are accessible with proper permission checks
5. Route changes emit audit events to LiNKbrain
6. No route collisions exist with other plugins
7. Route parameters are properly validated and bound

---

**Contract Version**: 1.0.0
**Owner**: LiNKaios kernel (route registry)
**Bound To**: CONTRACTS_MVO.md §1.2 (PluginManifest), PLUGIN_ARCHITECTURE_V2.md
