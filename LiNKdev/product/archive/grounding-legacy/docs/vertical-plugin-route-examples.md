# Vertical Plugin Route Registration - Reference Examples

Implementation examples for the vertical plugin route registration system.

## 1. LinkSites / WebsiteFactory Example

### 1.1 Extended Manifest with Routes

```typescript
// apps/linkaios-web/src/lib/plugins/websitefactory/manifest.ts

import type {
  PluginManifest,
  VerticalPluginRoute,
} from "@linktrend/linklogic-sdk";

export const WEBSITE_FACTORY_ROUTES: VerticalPluginRoute[] = [
  // Navigation route - main dashboard
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
    contextual_actions: [
      "linksites.site.create",
      "linksites.template.browse",
      "linksites.import.csv",
    ],
  },

  // Resource route - site detail
  {
    route_id: "linksites.resource.sites",
    kind: "resource",
    path: "/v/linksites/sites/:siteId",
    methods: ["GET"],
    display: {
      label: "Site Details",
      order: 10,
    },
    required_permissions: ["linksites.sites.read"],
    parameters: ["siteId"],
    contextual_actions: [
      "linksites.site.edit",
      "linksites.site.duplicate",
      "linksites.site.preview",
      "linksites.site.publish",
      "linksites.site.delete",
    ],
  },

  // Resource route - generation detail
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
    contextual_actions: [
      "linksites.generation.preview",
      "linksites.generation.approve",
      "linksites.generation.reject",
      "linksites.generation.regenerate",
    ],
  },

  // Resource route - template detail
  {
    route_id: "linksites.resource.templates",
    kind: "resource",
    path: "/v/linksites/templates/:templateId",
    methods: ["GET"],
    display: {
      label: "Template",
    },
    required_permissions: ["linksites.templates.read"],
    parameters: ["templateId"],
    contextual_actions: [
      "linksites.template.use",
      "linksites.template.preview",
    ],
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
  {
    route_id: "linksites.api.generations_list",
    kind: "api",
    path: "/api/v1/verticals/linksites/sites/:siteId/generations",
    methods: ["GET", "POST"],
    required_permissions: ["linksites.generations.read", "linksites.generations.write"],
    parameters: ["siteId"],
  },
  {
    route_id: "linksites.api.templates_list",
    kind: "api",
    path: "/api/v1/verticals/linksites/templates",
    methods: ["GET"],
    required_permissions: ["linksites.templates.read"],
  },
];

// Extended manifest with routes
export const WEBSITE_FACTORY_MANIFEST_WITH_ROUTES: PluginManifest = {
  ...WEBSITE_FACTORY_MANIFEST, // existing manifest

  public_surfaces: {
    ...WEBSITE_FACTORY_MANIFEST.public_surfaces,

    // NEW: Route declarations
    routes: WEBSITE_FACTORY_ROUTES,
  },
};
```

### 1.2 Route Handler Implementation

```typescript
// apps/linkaios-web/src/app/api/v1/verticals/linksites/sites/route.ts

import { NextRequest, NextResponse } from "next/server";
import { resolveRoute } from "@/lib/kernel/route-registry";
import { checkPermissions } from "@/lib/kernel/permission-adapter";
import { emitRouteEvent } from "@/lib/kernel/audit-emitter";
import { createSupabaseServiceClient } from "@linktrend/db";

const PLUGIN_ID = "linksites";
const ROUTE_ID = "linksites.api.sites_list";

/**
 * GET /api/v1/verticals/linksites/sites
 * List sites for tenant
 */
export async function GET(request: NextRequest) {
  const tenantId = request.headers.get("x-tenant-id");
  const userId = request.headers.get("x-user-id");

  if (!tenantId || !userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Missing tenant or user" } },
      { status: 401 },
    );
  }

  // Resolve route
  const route = resolveRoute(`/api/v1/verticals/${PLUGIN_ID}/sites`, "GET");
  if (!route || route.route_id !== ROUTE_ID) {
    return NextResponse.json(
      { error: { code: "ROUTE_NOT_FOUND", message: "Route not found" } },
      { status: 404 },
    );
  }

  // Check permissions
  const userPermissions = await getUserPermissions(tenantId, userId);
  const hasPermission = await checkPermissions(userPermissions, route.required_permissions);
  if (!hasPermission) {
    await emitRouteEvent("route.access_denied", {
      route_id: route.route_id,
      plugin_id: PLUGIN_ID,
      user_id: userId,
      missing_permissions: route.required_permissions.filter(
        (p) => !userPermissions.includes(p),
      ),
    });
    return NextResponse.json(
      { error: { code: "ROUTE_PERMISSION_DENIED", message: "Forbidden" } },
      { status: 403 },
    );
  }

  // Emit access event
  await emitRouteEvent("route.accessed", {
    route_id: route.route_id,
    plugin_id: PLUGIN_ID,
    user_id: userId,
  });

  // Fetch sites from database
  const supabase = createSupabaseServiceClient();
  const { data: sites, error } = await supabase
    .from("linksites_sites")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: { code: "DATABASE_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ sites });
}

/**
 * POST /api/v1/verticals/linksites/sites
 * Create new site
 */
export async function POST(request: NextRequest) {
  // Similar structure with write permission check
  // ...
}
```

### 1.3 Dashboard Page

```typescript
// apps/linkaios-web/src/app/(shell)/linksites/page.tsx

import { redirect } from "next/navigation";
import { resolveRoute } from "@/lib/kernel/route-registry";
import { getNavigationContext } from "@/lib/kernel/navigation-store";
import { loadPluginManifest } from "@/lib/kernel/manifest-loader";
import { VerticalDashboard } from "@/components/vertical/VerticalDashboard";
import { SitesList } from "@/components/linksites/SitesList";

export default async function LinkSitesDashboardPage() {
  const pluginId = "linksites";

  // Verify route exists
  const route = resolveRoute(`/${pluginId}`, "GET");
  if (!route) {
    redirect("/work");
  }

  // Load manifest
  const manifest = await loadPluginManifest(pluginId);

  // Get navigation context
  const navigation = await getNavigationContext(pluginId);

  return (
    <VerticalDashboard
      pluginId={pluginId}
      manifest={manifest}
      navigation={navigation}
      header={{
        title: manifest.plugin_name,
        description: manifest.purpose,
        icon: "Globe",
        mode: "development", // From tenant config
      }}
      primaryAction={{
        label: "New Site",
        href: "/linksites/new",
        variant: "primary",
      }}
    >
      <SitesList />
    </VerticalDashboard>
  );
}
```

## 2. LEXOS Litigation Example

### 2.1 Extended Manifest with Routes

```typescript
// apps/linkaios-web/src/lib/plugins/lexos/manifest.ts (sketch)

import type {
  PluginManifest,
  VerticalPluginRoute,
} from "@linktrend/linklogic-sdk";

export const LEXOS_ROUTES: VerticalPluginRoute[] = [
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
    contextual_actions: [
      "lexos.matter.create",
      "lexos.evidence.ingest",
    ],
  },

  // Resource route - matter detail
  {
    route_id: "lexos.resource.matters",
    kind: "resource",
    path: "/v/lexos/matters/:matterId",
    methods: ["GET"],
    display: {
      label: "Matter",
      order: 10,
    },
    required_permissions: ["lexos.matters.read"],
    parameters: ["matterId"],
    contextual_actions: [
      "lexos.matter.edit",
      "lexos.matter.evidence.ingest",
      "lexos.matter.assertion.create",
      "lexos.matter.close",
    ],
  },

  // Resource route - evidence detail
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
    contextual_actions: [
      "lexos.evidence.extract",
      "lexos.evidence.annotate",
      "lexos.evidence.link",
    ],
  },

  // Resource route - extraction detail
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
    contextual_actions: [
      "lexos.extraction.review",
      "lexos.extraction.approve",
      "lexos.extraction.reject",
    ],
  },

  // Mode-aware route - court filing (live only per D-084-B)
  {
    route_id: "lexos.resource.court_filing",
    kind: "resource",
    path: "/v/lexos/matters/:matterId/filings/:filingId",
    methods: ["GET", "POST"],
    display: {
      label: "Court Filing",
    },
    required_permissions: ["lexos.filings.read", "lexos.filings.write"],
    parent_route_id: "lexos.resource.matters",
    parameters: ["matterId", "filingId"],
    // Only available in live mode (development mode excludes this)
    available_in_modes: ["live"],
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
  {
    route_id: "lexos.api.extractions_list",
    kind: "api",
    path: "/api/v1/verticals/lexos/matters/:matterId/extractions",
    methods: ["GET", "POST"],
    required_permissions: ["lexos.extractions.read", "lexos.extractions.write"],
    parameters: ["matterId"],
  },
];
```

### 2.2 Mode-Aware Route Handler

```typescript
// apps/linkaios-web/src/app/api/v1/verticals/lexos/matters/route.ts

import { NextRequest, NextResponse } from "next/server";
import { resolveRoute, isRouteAvailableInMode } from "@/lib/kernel/route-registry";
import { getTenantMode } from "@/lib/kernel/tenant-config";

const PLUGIN_ID = "lexos";
const ROUTE_ID = "lexos.api.matters_list";

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get tenant mode (development/shadow/live)
  const mode = await getTenantMode(tenantId, PLUGIN_ID);

  // Resolve route
  const route = resolveRoute(`/api/v1/verticals/${PLUGIN_ID}/matters`, "GET");
  if (!route) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  // Check mode availability (for mode-aware routes)
  if (route.available_in_modes && !isRouteAvailableInMode(route, mode)) {
    return NextResponse.json(
      {
        error: {
          code: "ROUTE_MODE_UNAVAILABLE",
          message: `Route ${route.route_id} is not available in ${mode} mode`,
          available_in_modes: route.available_in_modes,
        },
      },
      { status: 403 },
    );
  }

  // ... rest of handler
}
```

## 3. LiNKapps Example

```typescript
// apps/linkaios-web/src/lib/plugins/linkapps/manifest.ts (sketch)

import type {
  VerticalPluginRoute,
} from "@linktrend/linklogic-sdk";

export const LINKAPPS_ROUTES: VerticalPluginRoute[] = [
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
    contextual_actions: [
      "linkapps.project.create",
      "linkapps.squad.spawn",
    ],
  },
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
    contextual_actions: [
      "linkapps.project.edit",
      "linkapps.project.squad.spawn",
      "linkapps.project.status.update",
    ],
  },
];
```

## 4. Route Registry Implementation Sketch

```typescript
// apps/linkaios-web/src/lib/kernel/route-registry.ts (implementation sketch)

import type { VerticalPluginRoute, RouteRegistrationResult } from "@linktrend/linklogic-sdk";

// In-memory state (singleton)
const state = {
  routes: new Map<string, VerticalPluginRoute>(),
  pathIndex: new Map<string, string>(), // path -> route_id
  pluginRoutes: new Map<string, Set<string>>(),
  navigationRoutes: [] as VerticalPluginRoute[],
};

/**
 * Register routes for a plugin.
 */
export function registerPluginRoutes(
  pluginId: string,
  routes: VerticalPluginRoute[],
): RouteRegistrationResult {
  const result: RouteRegistrationResult = {
    plugin_id: pluginId,
    routes_registered: 0,
    routes_failed: 0,
    collisions: [],
  };

  for (const route of routes) {
    // Check for collision
    const collision = detectCollision(route.path, pluginId);
    if (collision.exists) {
      result.routes_failed++;
      result.collisions.push({
        route_id: route.route_id,
        conflicting_path: route.path,
        existing_plugin: collision.existingPlugin!,
      });
      continue;
    }

    // Register route
    state.routes.set(route.route_id, route);
    state.pathIndex.set(route.path, route.route_id);

    // Add to plugin index
    if (!state.pluginRoutes.has(pluginId)) {
      state.pluginRoutes.set(pluginId, new Set());
    }
    state.pluginRoutes.get(pluginId)!.add(route.route_id);

    // Add to navigation routes if applicable
    if (route.kind === "navigation" || (route.kind === "resource" && route.display)) {
      state.navigationRoutes.push(route);
      // Sort by order
      state.navigationRoutes.sort((a, b) => (a.display?.order ?? 100) - (b.display?.order ?? 100));
    }

    result.routes_registered++;
  }

  return result;
}

/**
 * Unregister all routes for a plugin.
 */
export function unregisterPluginRoutes(pluginId: string): void {
  const routeIds = state.pluginRoutes.get(pluginId);
  if (!routeIds) return;

  for (const routeId of routeIds) {
    const route = state.routes.get(routeId);
    if (route) {
      state.routes.delete(routeId);
      state.pathIndex.delete(route.path);
    }
  }

  // Remove from navigation
  state.navigationRoutes = state.navigationRoutes.filter(
    (r) => !routeIds.has(r.route_id),
  );

  state.pluginRoutes.delete(pluginId);
}

/**
 * Resolve route by path.
 */
export function resolveRoute(
  path: string,
  method?: string,
): VerticalPluginRoute | null {
  // Exact match first
  const routeId = state.pathIndex.get(path);
  if (routeId) {
    return state.routes.get(routeId) ?? null;
  }

  // Pattern match (simplified - real implementation would use path-to-regexp)
  for (const [registeredPath, registeredRouteId] of state.pathIndex) {
    if (matchPath(path, registeredPath)) {
      return state.routes.get(registeredRouteId) ?? null;
    }
  }

  return null;
}

/**
 * Check for path collision.
 */
export function detectCollision(
  path: string,
  excludePluginId?: string,
): { exists: boolean; existingPlugin?: string; existingRouteId?: string } {
  const existingRouteId = state.pathIndex.get(path);
  if (!existingRouteId) {
    return { exists: false };
  }

  const existingRoute = state.routes.get(existingRouteId);
  if (excludePluginId && existingRoute) {
    // Check if existing route belongs to excluded plugin
    for (const [pluginId, routeIds] of state.pluginRoutes) {
      if (routeIds.has(existingRouteId) && pluginId !== excludePluginId) {
        return {
          exists: true,
          existingPlugin: pluginId,
          existingRouteId,
        };
      }
    }
    return { exists: false };
  }

  // Find which plugin owns this route
  for (const [pluginId, routeIds] of state.pluginRoutes) {
    if (routeIds.has(existingRouteId)) {
      return {
        exists: true,
        existingPlugin: pluginId,
        existingRouteId,
      };
    }
  }

  return { exists: false };
}

/**
 * Get all navigation routes.
 */
export function getNavigationRoutes(): VerticalPluginRoute[] {
  return [...state.navigationRoutes];
}

/**
 * Get all routes for a plugin.
 */
export function getPluginRoutes(pluginId: string): VerticalPluginRoute[] {
  const routeIds = state.pluginRoutes.get(pluginId);
  if (!routeIds) return [];

  return Array.from(routeIds)
    .map((id) => state.routes.get(id))
    .filter((r): r is VerticalPluginRoute => r !== undefined);
}

/**
 * Check if route is available in current mode.
 */
export function isRouteAvailableInMode(
  route: VerticalPluginRoute,
  mode: "development" | "shadow" | "live",
): boolean {
  if (!route.available_in_modes) {
    // Default: available in all modes
    return true;
  }
  return route.available_in_modes.includes(mode);
}

// Helper function (simplified path matching)
function matchPath(requestPath: string, registeredPath: string): boolean {
  // Convert registered path pattern to regex
  // e.g., "/v/linksites/sites/:siteId" -> "/v/linksites/sites/[^/]+"
  const pattern = registeredPath.replace(/:\w+/g, "[^/]+");
  const regex = new RegExp(`^${pattern}$`);
  return regex.test(requestPath);
}
```

## 5. Navigation Store Implementation Sketch

```typescript
// apps/linkaios-web/src/lib/navigation/navigation-store.ts (implementation sketch)

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { NavigationItem, ContextualAction, RecentResource } from "./types";
import { getNavigationRoutes, getPluginRoutes } from "@/lib/kernel/route-registry";
import { filterRoutesByPermissions } from "@/lib/kernel/permission-adapter";

interface NavigationState {
  items: NavigationItem[];
  expandedSections: Set<string>;
  activeItemId: string | null;
  recentResources: RecentResource[];
  contextualActions: ContextualAction[];
  isLoading: boolean;
}

interface NavigationActions {
  initialize: (userPermissions: string[]) => void;
  setActiveRoute: (path: string) => void;
  toggleSection: (sectionId: string) => void;
  expandSection: (sectionId: string) => void;
  setContextualActions: (actions: ContextualAction[]) => void;
  addRecentResource: (resource: RecentResource) => void;
}

export const useNavigationStore = create(
  subscribeWithSelector<NavigationState & NavigationActions>((set, get) => ({
    items: [],
    expandedSections: new Set(),
    activeItemId: null,
    recentResources: [],
    contextualActions: [],
    isLoading: false,

    initialize: (userPermissions) => {
      // Get all navigation routes
      const navRoutes = getNavigationRoutes();

      // Filter by permissions
      const allowedRoutes = filterRoutesByPermissions(navRoutes, userPermissions);

      // Convert to navigation items
      const items = routesToNavigationItems(allowedRoutes);

      set({ items, isLoading: false });
    },

    setActiveRoute: (path) => {
      const { items } = get();

      // Find matching item
      const activeItem = findItemByPath(items, path);

      set({ activeItemId: activeItem?.id ?? null });

      // Expand parent sections
      if (activeItem?.parentId) {
        get().expandSection(activeItem.parentId);
      }
    },

    toggleSection: (sectionId) => {
      const { expandedSections } = get();
      const newExpanded = new Set(expandedSections);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      set({ expandedSections: newExpanded });
    },

    expandSection: (sectionId) => {
      const { expandedSections } = get();
      const newExpanded = new Set(expandedSections);
      newExpanded.add(sectionId);
      set({ expandedSections: newExpanded });
    },

    setContextualActions: (actions) => {
      set({ contextualActions: actions });
    },

    addRecentResource: (resource) => {
      const { recentResources } = get();
      // Add to front, remove duplicates, limit to 10
      const filtered = recentResources.filter(
        (r) => r.resourceId !== resource.resourceId || r.pluginId !== resource.pluginId,
      );
      set({ recentResources: [resource, ...filtered].slice(0, 10) });
    },
  })),
);

// Helper functions
function routesToNavigationItems(routes: VerticalPluginRoute[]): NavigationItem[] {
  return routes.map((route) => ({
    id: route.route_id,
    kind: route.kind === "navigation" ? "top" : "item",
    label: route.display?.label ?? route.route_id,
    icon: route.display?.icon,
    href: route.path,
    order: route.display?.order ?? 100,
    requiredPermissions: route.required_permissions,
    pluginId: extractPluginId(route.route_id),
    activeMatch: {
      startsWith: route.path.replace(/:\w+/g, ""),
    },
  }));
}

function extractPluginId(routeId: string): string {
  // e.g., "linksites.navigation.dashboard" -> "linksites"
  return routeId.split(".")[0];
}

function findItemByPath(items: NavigationItem[], path: string): NavigationItem | null {
  for (const item of items) {
    if (matchesPath(path, item.href)) {
      return item;
    }
    if (item.children) {
      const childMatch = findItemByPath(item.children, path);
      if (childMatch) return childMatch;
    }
  }
  return null;
}

function matchesPath(requestPath: string, itemHref: string): boolean {
  // Simplified matching logic
  return requestPath === itemHref || requestPath.startsWith(itemHref + "/");
}
```

## 6. Route Pattern Summary

| Pattern | Description | Example |
|---------|-------------|---------|
| `/${plugin_id}` | Dashboard | `/linksites`, `/lexos` |
| `/v/${plugin_id}/${resource}/:id` | Resource detail | `/v/linksites/sites/:siteId` |
| `/v/${plugin_id}/${resource}/:id/${subresource}/:subId` | Nested resource | `/v/lexos/matters/:matterId/evidence/:evidenceId` |
| `/api/v1/verticals/${plugin_id}/${resource}` | API collection | `/api/v1/verticals/linksites/sites` |
| `/api/v1/verticals/${plugin_id}/${resource}/:id` | API item | `/api/v1/verticals/lexos/matters/:matterId` |

---

**Version**: 1.0.0
**Status**: Reference / Documentation
**Dependencies**: vertical-plugin-route-contract.md, kernel-vertical-route-extension.md
