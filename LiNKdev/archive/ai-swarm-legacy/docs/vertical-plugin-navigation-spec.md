# Vertical Plugin Navigation Specification

LiNKaios shell navigation integration for vertical plugins.

## 1. Purpose

This specification defines how vertical plugins integrate with the LiNKaios shell navigation system, including:
- Top-level navigation entries
- Section navigation within vertical dashboards
- Contextual actions based on current route
- Quick access to recent vertical resources

## 2. Navigation Structure

### 2.1 Hierarchy

```
LiNKaios Shell
├── Top Navigation (app-wide)
│   ├── Dashboard
│   ├── Work          ← Vertical plugins appear here
│   │   ├── LinkSites (from plugin routes)
│   │   ├── LEXOS     (from plugin routes)
│   │   └── LiNKapps  (from plugin routes)
│   ├── Projects
│   ├── Skills
│   └── Memory
├── Contextual Sidebar (route-specific)
│   └── Vertical-specific sections
└── Quick Actions (floating/accessible)
```

### 2.2 Navigation Item Types

| Type | Description | Source |
|------|-------------|--------|
| `top` | Top-level primary nav | Plugin `kind: "navigation"` routes |
| `section` | Grouping headers | Derived from plugin manifest sections |
| `item` | Actionable navigation items | Plugin routes + contextual actions |
| `recent` | Recently accessed resources | User activity + plugin resource routes |
| `action` | Quick contextual actions | Plugin `contextual_actions` |

## 3. Navigation Item Schema

```typescript
interface NavigationItem {
  /** Unique identifier */
  id: string;

  /** Navigation item kind */
  kind: "top" | "section" | "item" | "recent" | "action";

  /** Display label */
  label: string;

  /** Icon name (from icon library) */
  icon?: string;

  /** Navigation href */
  href: string;

  /** Display order (lower = earlier) */
  order: number;

  /** Required permissions */
  requiredPermissions: string[];

  /** Parent item (for nested navigation) */
  parentId?: string;

  /** Children (for nested items) */
  children?: NavigationItem[];

  /** Associated plugin */
  pluginId: string;

  /** Badge/indicator */
  badge?: {
    count?: number;
    variant: "default" | "info" | "success" | "warning" | "error";
  };

  /** Active state matching */
  activeMatch?: {
    /** Exact path match */
    exact?: boolean;
    /** Path prefix match */
    startsWith?: string;
    /** Regex pattern */
    pattern?: string;
  };
}
```

## 4. Vertical Plugin Navigation Registration

### 4.1 From Route Declaration

Navigation items are primarily derived from plugin route declarations:

```typescript
/**
 * Convert plugin routes to navigation items.
 */
function routesToNavigationItems(
  routes: VerticalPluginRoute[],
  pluginId: string,
): NavigationItem[] {
  return routes
    .filter((route) => route.kind === "navigation" || route.kind === "resource")
    .map((route) => ({
      id: route.route_id,
      kind: route.kind === "navigation" ? "top" : "item",
      label: route.display?.label ?? route.route_id,
      icon: route.display?.icon,
      href: route.path,
      order: route.display?.order ?? 100,
      requiredPermissions: route.required_permissions,
      pluginId,
      activeMatch: {
        startsWith: route.path.replace(/:\w+/g, ""), // Remove param placeholders
      },
    }));
}
```

### 4.2 Standard Navigation Slots

| Slot | Order | Reserved For | Examples |
|------|-------|--------------|----------|
| Dashboard | 0 | Platform home | `/dashboard` |
| Work | 10 | Vertical plugins | `/linksites`, `/lexos`, `/linkapps` |
| Projects | 20 | Project management | `/projects` |
| Skills | 30 | Capability catalog | `/skills` |
| Memory | 40 | Knowledge/audit | `/memory` |
| Settings | 100 | Admin | `/settings` |

Vertical plugins default to the **Work** slot with configurable `display.order`.

## 5. Vertical Dashboard Layout

### 5.1 Dashboard Structure

Each vertical plugin dashboard (`/${plugin_id}`) consists of:

```
┌─────────────────────────────────────────────┐
│ Vertical Header                             │
│ - Plugin name, icon                         │
│ - Description                               │
│ - Mode indicator (dev/shadow/live)          │
├─────────────────────────────────────────────┤
│ Action Bar                                  │
│ - Primary CTA (e.g., "New Site", "New Matter") │
│ - Filter/search                             │
│ - View toggle (list/grid)                   │
├────────────────┬────────────────────────────┤
│                │                            │
│ Sidebar        │    Main Content            │
│ Navigation     │    - Resource list         │
│ - Overview     │    - Recent activity       │
│ - Resources    │    - Quick stats           │
│ - Workflows    │                            │
│ - Settings     │                            │
│                │                            │
└────────────────┴────────────────────────────┘
```

### 5.2 Dashboard Navigation Items

Standard vertical dashboard sections:

```typescript
const STANDARD_DASHBOARD_SECTIONS: NavigationItem[] = [
  {
    id: "overview",
    kind: "section",
    label: "Overview",
    href: "#overview",
    order: 0,
    pluginId: "system",
  },
  {
    id: "resources",
    kind: "section",
    label: "Resources",
    href: "#resources",
    order: 10,
    pluginId: "system",
  },
  {
    id: "workflows",
    kind: "section",
    label: "Workflows",
    href: "#workflows",
    order: 20,
    pluginId: "system",
  },
  {
    id: "settings",
    kind: "section",
    label: "Settings",
    href: "#settings",
    order: 30,
    pluginId: "system",
  },
];
```

## 6. Contextual Actions

### 6.1 Contextual Action Schema

```typescript
interface ContextualAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  href?: string;
  onClick?: () => void;
  requiredPermissions: string[];
  variant: "default" | "primary" | "danger";
  order: number;
}
```

### 6.2 Route-Based Contextual Actions

Actions appear based on current route context:

| Route Pattern | Example Actions |
|---------------|-----------------|
| `/${plugin_id}` | "Create New", "Import", "View Reports" |
| `/v/${plugin}/${resource}/:id` | "Edit", "Duplicate", "Archive", "Delete" |
| `/v/${plugin}/${resource}/:id/edit` | "Save", "Cancel", "Preview" |
| Work request in progress | "Pause", "Cancel", "Approve" |

### 6.3 Contextual Action Registration

From plugin manifest:

```typescript
// In manifest.public_surfaces.routes
{
  route_id: "linksites.resource.sites",
  kind: "resource",
  path: "/v/linksites/sites/:siteId",
  // ...
  contextual_actions: [
    "linksites.site.edit",
    "linksites.site.duplicate",
    "linksites.site.preview",
    "linksites.site.delete",
  ],
}
```

Action definitions are registered separately in the capability catalog or plugin actions registry.

## 7. Recent Resources

### 7.1 Recent Item Tracking

Recently accessed resources are tracked and surfaced in navigation:

```typescript
interface RecentResource {
  resourceId: string;
  resourceType: string;
  pluginId: string;
  title: string;
  href: string;
  accessedAt: string;
  icon?: string;
}

/**
 * Track resource access.
 */
export async function trackResourceAccess(
  userId: string,
  resource: RecentResource,
): Promise<void>;

/**
 * Get recent resources for user.
 */
export async function getRecentResources(
  userId: string,
  limit?: number,
): Promise<RecentResource[]>;
```

### 7.2 Recent Resources Navigation

```
Work
├── LinkSites
│   ├── Recent
│   │   ├── Acme Corp Website (2 min ago)
│   │   ├── Smith & Co Preview (1 hour ago)
│   │   └── ...
│   └── Browse All
├── LEXOS
│   ├── Recent
│   │   ├── Matter 2024-001 (5 min ago)
│   │   └── ...
```

## 8. Navigation State Management

### 8.1 State Shape

```typescript
interface NavigationState {
  /** All available items (filtered by permissions) */
  items: NavigationItem[];

  /** Currently expanded sections */
  expandedSections: Set<string>;

  /** Currently active item */
  activeItemId: string | null;

  /** Recent resources by plugin */
  recentResources: Map<string, RecentResource[]>;

  /** Contextual actions for current route */
  contextualActions: ContextualAction[];

  /** Loading state */
  isLoading: boolean;
}
```

### 8.2 Navigation Store API

```typescript
/**
 * Initialize navigation from registered plugins.
 */
export function initializeNavigation(
  userPermissions: string[],
): void;

/**
 * Set active navigation item by route.
 */
export function setActiveRoute(path: string): void;

/**
 * Toggle section expansion.
 */
export function toggleSection(sectionId: string): void;

/**
 * Expand section (for deep links).
 */
export function expandSection(sectionId: string): void;

/**
 * Update contextual actions.
 */
export function setContextualActions(
  actions: ContextualAction[],
): void;

/**
 * Refresh recent resources.
 */
export function refreshRecentResources(): Promise<void>;
```

## 9. Vertical-Specific Navigation Examples

### 9.1 LinkSites Navigation

```typescript
const LINKSITES_NAVIGATION: NavigationItem[] = [
  {
    id: "linksites.navigation.dashboard",
    kind: "top",
    label: "LinkSites",
    icon: "Globe",
    href: "/linksites",
    order: 10,
    requiredPermissions: ["linksites.dashboard.read"],
    pluginId: "linksites",
    children: [
      {
        id: "linksites.section.overview",
        kind: "section",
        label: "Overview",
        href: "/linksites#overview",
        order: 0,
        pluginId: "linksites",
      },
      {
        id: "linksites.item.sites",
        kind: "item",
        label: "Sites",
        href: "/linksites/sites",
        order: 10,
        requiredPermissions: ["linksites.sites.read"],
        pluginId: "linksites",
      },
      {
        id: "linksites.item.templates",
        kind: "item",
        label: "Templates",
        href: "/linksites/templates",
        order: 20,
        requiredPermissions: ["linksites.templates.read"],
        pluginId: "linksites",
      },
      {
        id: "linksites.item.generations",
        kind: "item",
        label: "Generations",
        href: "/linksites/generations",
        order: 30,
        requiredPermissions: ["linksites.generations.read"],
        pluginId: "linksites",
      },
    ],
  },
];
```

### 9.2 LEXOS Navigation

```typescript
const LEXOS_NAVIGATION: NavigationItem[] = [
  {
    id: "lexos.navigation.dashboard",
    kind: "top",
    label: "LEXOS",
    icon: "Scale",
    href: "/lexos",
    order: 20,
    requiredPermissions: ["lexos.dashboard.read"],
    pluginId: "lexos",
    children: [
      {
        id: "lexos.section.matters",
        kind: "section",
        label: "Matters",
        href: "/lexos/matters",
        order: 0,
        pluginId: "lexos",
      },
      {
        id: "lexos.item.evidence",
        kind: "item",
        label: "Evidence",
        href: "/lexos/evidence",
        order: 10,
        requiredPermissions: ["lexos.evidence.read"],
        pluginId: "lexos",
      },
      {
        id: "lexos.item.extractions",
        kind: "item",
        label: "Extractions",
        href: "/lexos/extractions",
        order: 20,
        requiredPermissions: ["lexos.extractions.read"],
        pluginId: "lexos",
      },
      {
        id: "lexos.section.assertions",
        kind: "section",
        label: "Assertions",
        href: "/lexos/assertions",
        order: 30,
        pluginId: "lexos",
      },
    ],
  },
];
```

## 10. Responsive Behavior

### 10.1 Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| Desktop (>1024px) | Full sidebar + top nav |
| Tablet (768-1024px) | Collapsible sidebar |
| Mobile (<768px) | Bottom sheet navigation |

### 10.2 Mobile Navigation

On mobile, vertical navigation becomes a bottom sheet:

```
┌─────────────────────────┐
│  App Bar                │
├─────────────────────────┤
│                         │
│    Main Content         │
│                         │
├─────────────────────────┤
│  📊  🔧  ⚖️  📦  ⚙️  │
│ Dash Work LEXOS Apps Settings
└─────────────────────────┘
          ↑
   Tap to open vertical
   selection bottom sheet
```

## 11. Accessibility

### 11.1 Requirements

- Keyboard navigation (Tab, Enter, Arrow keys)
- Screen reader announcements for route changes
- Focus management on navigation
- ARIA labels for icons
- High contrast support

### 11.2 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette/quick nav |
| `g` then `w` | Go to Work section |
| `g` then `d` | Go to Dashboard |
| `g` then `p` | Go to Projects |
| `g` then number | Go to nth vertical plugin |

## 12. Audit and Analytics

### 12.1 Navigation Events

| Event | Payload |
|-------|---------|
| `navigation.item_clicked` | `{ item_id, plugin_id, href }` |
| `navigation.section_expanded` | `{ section_id, plugin_id }` |
| `navigation.contextual_action` | `{ action_id, plugin_id, route_id }` |
| `navigation.quick_access` | `{ resource_id, plugin_id, type: "recent" }` |

## 13. Non-Goals

Per ecosystem boundaries:

- **Plugin UI implementation**: Plugins own their dashboard UI; shell provides navigation frame only
- **Permission grants**: LinkSkills owns permission definitions; shell only checks them
- **Cross-tenant navigation**: Navigation is strictly scoped to current tenant
- **Offline navigation**: Online-only; no offline queue for navigation

## 14. Files

### New Files
- `apps/linkaios-web/src/lib/navigation/navigation-store.ts`
- `apps/linkaios-web/src/lib/navigation/use-navigation.ts` (React hook)
- `apps/linkaios-web/src/components/navigation/VerticalNav.tsx`
- `apps/linkaios-web/src/components/navigation/ContextualActions.tsx`
- `apps/linkaios-web/src/components/navigation/RecentResources.tsx`

### Modified Files
- `apps/linkaios-web/src/components/shell/Sidebar.tsx` (integrate vertical nav)
- `apps/linkaios-web/src/components/shell/TopNav.tsx` (add vertical dropdown)

---

**Specification Version**: 1.0.0
**Owner**: LiNKaios UI/UX team
**Dependencies**: vertical-plugin-route-contract.md, kernel-vertical-route-extension.md
