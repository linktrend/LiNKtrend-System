# LiNKaios Kernel Vertical Route Extension

Specification for extending the LiNKaios kernel to support vertical plugin route registration and resolution.

## 1. Overview

This specification extends the kernel manifest loader (CONTRACTS_MVO.md §1.1, `apps/linkaios-web/src/lib/kernel/manifest-loader.ts`) to support vertical plugin route registration per `vertical-plugin-route-contract.md`.

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LiNKaios Kernel                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Manifest   │  │    Route     │  │  Navigation  │      │
│  │   Loader     │→ │   Registry   │→ │    Store     │      │
│  │              │  │              │  │              │      │
│  │ - Load       │  │ - Register   │  │ - UI routes  │      │
│  │ - Validate   │  │ - Resolve    │  │ - Menu items │      │
│  │ - Extract    │  │ - Collision  │  │ - Context    │      │
│  │   routes     │  │   detect     │  │   actions    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           ↓                                                  │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Permission  │  │    Audit     │                        │
│  │   Adapter    │  │   Emitter    │                        │
│  │              │  │              │                        │
│  │ Check perms  │  │ Route events │                        │
│  │ with Skills  │  │ to Linkbrain │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
         ↓                              ↓
┌────────────────┐              ┌────────────────┐
│   LinkSkills   │              │   LiNKbrain    │
│  (permissions) │              │  (audit trail) │
└────────────────┘              └────────────────┘
```

### 2.2 Data Flow

```
1. PLUGIN BOOT
   Plugin manifest loaded from DB/filesystem
        ↓
2. ROUTE EXTRACTION
   Kernel extracts routes[] from manifest.public_surfaces
        ↓
3. VALIDATION
   - Schema validation (Zod)
   - Path collision detection
   - Permission binding validation
        ↓
4. REGISTRATION
   Routes registered in Route Registry
        ↓
5. NAVIGATION BUILD
   Navigation routes added to Navigation Store
        ↓
6. API MOUNT (Next.js)
   API routes available at /api/v1/verticals/*
        ↓
7. RUNTIME RESOLUTION
   Request → Route Resolution → Permission Check → Handler
```

## 3. Kernel Extensions

### 3.1 Extended Manifest Loader

Additions to `apps/linkaios-web/src/lib/kernel/manifest-loader.ts`:

```typescript
// Extended types
interface RouteRegistrationResult {
  plugin_id: string;
  routes_registered: number;
  routes_failed: number;
  collisions: Array<{
    route_id: string;
    conflicting_path: string;
    existing_plugin: string;
  }>;
}

interface LoadedPluginWithRoutes {
  plugin_id: string;
  manifest: PluginManifest;
  routes: VerticalPluginRoute[];
  navigation_items: NavigationItem[];
}

// Extended functions

/**
 * Load plugin manifest and extract routes.
 * Called at boot or when plugin installed.
 */
export async function loadPluginWithRoutes(
  pluginId: string,
  env: Env,
): Promise<LoadedPluginWithRoutes>;

/**
 * Validate routes from manifest.
 * Returns validation errors (empty = valid).
 */
export function validatePluginRoutes(
  routes: unknown[],
  pluginId: string,
): Array<{ code: string; message: string; field: string }>;

/**
 * Extract navigation items from routes.
 */
export function extractNavigationItems(
  routes: VerticalPluginRoute[],
): NavigationItem[];
```

### 3.2 Route Registry

New module: `apps/linkaios-web/src/lib/kernel/route-registry.ts`

```typescript
/**
 * Route Registry - manages all vertical plugin routes.
 *
 * Singleton pattern. Lives for the lifetime of the kernel.
 */

interface RouteRegistryState {
  /** All registered routes by route_id */
  routes: Map<string, VerticalPluginRoute>;

  /** Path index for collision detection and resolution */
  pathIndex: Map<string, string>; // path -> route_id

  /** Routes by plugin */
  pluginRoutes: Map<string, Set<string>>; // plugin_id -> Set<route_id>

  /** Navigation routes ordered by display.order */
  navigationRoutes: VerticalPluginRoute[];
}

/**
 * Register routes for a plugin.
 * Idempotent: subsequent calls update existing routes.
 */
export function registerPluginRoutes(
  pluginId: string,
  routes: VerticalPluginRoute[],
): RouteRegistrationResult;

/**
 * Unregister all routes for a plugin.
 */
export function unregisterPluginRoutes(pluginId: string): void;

/**
 * Resolve route by path.
 */
export function resolveRoute(
  path: string,
  method?: string,
): VerticalPluginRoute | null;

/**
 * Resolve route by route_id.
 */
export function getRoute(routeId: string): VerticalPluginRoute | null;

/**
 * Get all navigation routes in display order.
 */
export function getNavigationRoutes(): VerticalPluginRoute[];

/**
 * Get all routes for a plugin.
 */
export function getPluginRoutes(pluginId: string): VerticalPluginRoute[];

/**
 * Check for path collision.
 */
export function detectCollision(
  path: string,
  excludePluginId?: string,
): { exists: boolean; existingPlugin?: string; existingRouteId?: string };
```

### 3.3 Navigation Store Extension

New module: `apps/linkaios-web/src/lib/kernel/navigation-store.ts`

```typescript
/**
 * Navigation Store - manages UI navigation state.
 *
 * Integrates with existing LiNKaios navigation state.
 */

interface NavigationItem {
  id: string; // route_id
  kind: "top" | "section" | "item";
  label: string;
  icon?: string;
  href: string;
  order: number;
  requiredPermissions: string[];
  children?: NavigationItem[];
  plugin_id: string;
}

interface NavigationStoreState {
  /** Top-level navigation items */
  topLevel: NavigationItem[];

  /** Quick access items (recently visited) */
  recent: NavigationItem[];

  /** Current contextual actions */
  contextualActions: ContextualAction[];
}

/**
 * Build navigation structure from registered routes.
 */
export function buildNavigation(
  userPermissions: string[],
): NavigationItem[];

/**
 * Get contextual actions for current route.
 */
export function getContextualActions(
  routeId: string,
  userPermissions: string[],
): ContextualAction[];
```

### 3.4 Route Resolution Middleware

Extension to `apps/linkaios-web/src/middleware.ts`:

```typescript
/**
 * Route resolution middleware for Next.js.
 *
 * Resolves vertical plugin routes and sets context headers.
 */

interface RouteResolutionContext {
  route_id?: string;
  plugin_id?: string;
  route_params?: Record<string, string>;
  resolved_by: "kernel" | "nextjs";
}

/**
 * Middleware function to resolve routes.
 */
export function routeResolutionMiddleware(
  request: NextRequest,
): NextResponse;
```

## 4. API Route Structure

### 4.1 API Route Convention

```
/apps/linkaios-web/src/app/api/v1/verticals/
├── [plugin_id]/          # Dynamic plugin route
│   └── route.ts          # Plugin-level operations
└── [plugin_id]/
    └── [resource_type]/  # Dynamic resource type
        └── route.ts      # Resource collection operations
```

### 4.2 API Route Handler

```typescript
// apps/linkaios-web/src/app/api/v1/verticals/[plugin_id]/route.ts

import { resolveRoute } from "@/lib/kernel/route-registry";
import { checkPermissions } from "@/lib/kernel/permission-adapter";
import { emitAuditEvent } from "@/lib/kernel/audit-emitter";

export async function GET(
  request: Request,
  { params }: { params: { plugin_id: string } },
) {
  const { plugin_id } = params;

  // Resolve route
  const route = resolveRoute(`/api/v1/verticals/${plugin_id}`, "GET");
  if (!route) {
    return new Response("Route not found", { status: 404 });
  }

  // Check permissions
  const userPermissions = await getUserPermissions(request);
  const hasPermission = await checkPermissions(
    userPermissions,
    route.required_permissions,
  );
  if (!hasPermission) {
    await emitAuditEvent({
      action: "route.access_denied",
      subject: { route_id: route.route_id, plugin_id },
    });
    return new Response("Forbidden", { status: 403 });
  }

  // Emit access event
  await emitAuditEvent({
    action: "route.accessed",
    subject: { route_id: route.route_id, plugin_id },
  });

  // Delegate to plugin handler or capability
  return handleVerticalRequest(request, route);
}
```

## 5. UI Route Structure

### 5.1 Shell Route Convention

```
/apps/linkaios-web/src/app/(shell)/
├── work/
│   └── [plugin_id]/          # Vertical dashboard
│       └── page.tsx
└── v/
    └── [plugin_id]/
        └── [resource_type]/
            └── [resource_id]/
                └── page.tsx
```

### 5.2 Dynamic Page Handler

```typescript
// apps/linkaios-web/src/app/(shell)/work/[plugin_id]/page.tsx

import { resolveRoute } from "@/lib/kernel/route-registry";
import { getNavigationContext } from "@/lib/kernel/navigation-store";

interface VerticalDashboardPageProps {
  params: { plugin_id: string };
}

export default async function VerticalDashboardPage({
  params,
}: VerticalDashboardPageProps) {
  const { plugin_id } = params;

  // Resolve route
  const route = resolveRoute(`/${plugin_id}`, "GET");
  if (!route) {
    notFound();
  }

  // Load plugin manifest for UI configuration
  const manifest = await loadPluginManifest(plugin_id);

  // Get navigation context
  const navigation = await getNavigationContext(plugin_id);

  // Render with plugin-specific UI panels
  return (
    <VerticalDashboard
      pluginId={plugin_id}
      manifest={manifest}
      navigation={navigation}
    />
  );
}
```

## 6. Permission Integration

### 6.1 Permission Adapter

New module: `apps/linkaios-web/src/lib/kernel/permission-adapter.ts`

```typescript
/**
 * Permission Adapter - bridges kernel with LinkSkills permission system.
 */

import { checkPermissions as linkskillsCheck } from "@linktrend/linklogic-sdk";

/**
 * Check if user has required permissions for a route.
 */
export async function checkPermissions(
  userPermissions: string[],
  requiredPermissions: string[],
): Promise<boolean>;

/**
 * Filter routes by user permissions.
 */
export function filterRoutesByPermissions(
  routes: VerticalPluginRoute[],
  userPermissions: string[],
): VerticalPluginRoute[];

/**
 * Get effective permissions for tenant user.
 */
export async function getEffectivePermissions(
  tenantId: string,
  userId: string,
): Promise<string[]>;
```

## 7. Audit Integration

### 7.1 Route Audit Events

Extended audit events per CONTRACTS_MVO.md §6.3.1:

| Action | Payload | Description |
|--------|---------|-------------|
| `route.registered` | `{ route_id, plugin_id, path }` | Route registered |
| `route.unregistered` | `{ route_id, plugin_id }` | Route unregistered |
| `route.accessed` | `{ route_id, plugin_id, user_id }` | Route accessed |
| `route.access_denied` | `{ route_id, plugin_id, user_id, missing_permissions }` | Permission denied |
| `route.collision_detected` | `{ route_id, plugin_id, path, existing_plugin }` | Path collision |
| `route.parameter_invalid` | `{ route_id, plugin_id, param, value }` | Invalid parameter |
| `route.resolved` | `{ path, route_id, plugin_id, resolved_params }` | Route resolved |

### 7.2 Audit Emitter Extension

Additions to `apps/linkaios-web/src/lib/kernel/audit-emitter.ts`:

```typescript
/**
 * Emit route-specific audit events.
 */
export async function emitRouteEvent(
  action:
    | "route.registered"
    | "route.unregistered"
    | "route.accessed"
    | "route.access_denied"
    | "route.collision_detected",
  payload: Record<string, unknown>,
): Promise<void>;
```

## 8. Error Handling

### 8.1 Error Codes

Extended from CONTRACTS_MVO.md §5.4:

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `ROUTE_NOT_FOUND` | Route does not exist | 404 |
| `ROUTE_COLLISION` | Path collision with existing route | 409 |
| `ROUTE_PERMISSION_DENIED` | User lacks required permission | 403 |
| `ROUTE_PARAMETER_INVALID` | Route parameter validation failed | 400 |
| `ROUTE_PLUGIN_DISABLED` | Plugin is disabled | 503 |
| `ROUTE_RESOLUTION_FAILED` | Route resolution error | 500 |

### 8.2 Error Response Shape

```typescript
interface RouteErrorResponse {
  error: {
    code: string;
    message: string;
    route_id?: string;
    plugin_id?: string;
    path?: string;
  };
}
```

## 9. Mode Support

### 9.1 Mode-Aware Route Resolution

Per DECISIONS.md D-084-B (LEXOS mode restrictions):

```typescript
/**
 * Check if route is available in current mode.
 */
export function isRouteAvailableInMode(
  route: VerticalPluginRoute,
  mode: "development" | "shadow" | "live",
): boolean;

/**
 * Filter routes by current mode.
 */
export function filterRoutesByMode(
  routes: VerticalPluginRoute[],
  mode: "development" | "shadow" | "live",
): VerticalPluginRoute[];
```

## 10. Implementation Phases

### Phase 1: Core Registry
1. Create `route-registry.ts` with basic CRUD
2. Add route validation
3. Add collision detection

### Phase 2: Navigation Integration
1. Extend manifest loader with route extraction
2. Create `navigation-store.ts`
3. Build navigation from routes

### Phase 3: API Routes
1. Create `/api/v1/verticals/[plugin_id]/*` route handlers
2. Integrate permission checks
3. Add audit events

### Phase 4: UI Routes
1. Create `/work/[plugin_id]` dashboard pages
2. Create `/v/[plugin_id]/*` resource pages
3. Integrate with existing shell layout

### Phase 5: Advanced Features
1. Contextual actions
2. Mode-aware routing
3. Dynamic parameter validation

## 11. Testing Strategy

### 11.1 Unit Tests

```typescript
// route-registry.test.ts
describe("Route Registry", () => {
  test("registers plugin routes", () => {});
  test("detects path collisions", () => {});
  test("resolves routes by path", () => {});
  test("unregisters plugin routes", () => {});
});
```

### 11.2 Integration Tests

```typescript
// kernel-route-integration.test.ts
describe("Kernel Route Integration", () => {
  test("loads plugin with routes from manifest", () => {});
  test("builds navigation from registered routes", () => {});
  test("permission checks block unauthorized access", () => {});
  test("audit events emitted on route access", () => {});
});
```

## 12. Migration Path

### 12.1 v1 Manifest Migration

For plugins without `routes` field:

```typescript
/**
 * Auto-generate routes from v1 manifest.
 */
export function generateRoutesFromV1Manifest(
  manifest: PluginManifestV1,
): VerticalPluginRoute[] {
  return [
    {
      route_id: `${manifest.plugin_id}.navigation.dashboard`,
      kind: "navigation",
      path: `/${manifest.plugin_id}`,
      methods: ["GET"],
      display: {
        label: manifest.plugin_name,
        order: 100,
      },
      required_permissions: [`${manifest.plugin_id}.dashboard.read`],
    },
  ];
}
```

## 13. Non-Goals

Per ARCHITECTURE_RULES.md ecosystem boundaries:

- **Router implementation**: Kernel uses Next.js App Router; does not implement custom router
- **Permission policy**: LinkSkills owns permission grants; kernel only checks
- **Plugin UI implementation**: Plugins own their UI components; kernel only provides route mounting points
- **Capability execution**: LiNKautowork and capability plugins own API execution
- **Cross-tenant routes**: Routes are strictly tenant-scoped; no cross-tenant navigation

## 14. Files to Create/Modify

### New Files
- `apps/linkaios-web/src/lib/kernel/route-registry.ts`
- `apps/linkaios-web/src/lib/kernel/navigation-store.ts`
- `apps/linkaios-web/src/lib/kernel/permission-adapter.ts`
- `apps/linkaios-web/src/app/api/v1/verticals/[plugin_id]/route.ts`
- `apps/linkaios-web/src/app/(shell)/work/[plugin_id]/page.tsx`
- `apps/linkaios-web/src/app/(shell)/v/[plugin_id]/[...path]/page.tsx`

### Modified Files
- `apps/linkaios-web/src/lib/kernel/manifest-loader.ts` (add route extraction)
- `apps/linkaios-web/src/middleware.ts` (add route resolution)
- `packages/linklogic-sdk/types/plugin.ts` (add route types)

---

**Specification Version**: 1.0.0
**Owner**: LiNKaios kernel team
**Dependencies**: CONTRACTS_MVO.md §1.2, vertical-plugin-route-contract.md
