import { stripAppBasePath } from "@/lib/app-surface";

/** Title + subtitle for shared shell page headers (breadcrumb leaf = title). */

export type ShellPageMeta = {
  title: string;
  subtitle: string;
};

const EXACT: Record<string, ShellPageMeta> = {
  "/projects/new": {
    title: "Add Project",
    subtitle: "Choose suite modules — each module defines the phases for this work.",
  },
  "/memory": {
    title: "LiNKbrain",
    subtitle: "Institutional memory — inbox, project context, agent notes, and company knowledge.",
  },
  "/skills": {
    title: "LiNKskills",
    subtitle: "Company skill and tool catalog — what LiNKbots may run under governance.",
  },
  "/skills/skills/new": {
    title: "Add Skill",
    subtitle: "Creates a draft you can open to edit the prompt, tools, and files.",
  },
  "/skills/tools/new": {
    title: "Add Tool",
    subtitle: "Creates a draft tool in the catalogue for governed execution.",
  },
  "/suites": {
    title: "Suites",
    subtitle: "Tenant-enabled business packages and how they connect to projects.",
  },
  "/metrics": {
    title: "Metrics",
    subtitle: "Performance observability — cost, tokens, run time, success/failure, and usage by project, LiNKbot, model, tool, and skill.",
  },
  "/licensees": {
    title: "Licensees",
    subtitle: "Tenant registry — overview, companies & brands, billing, and Chatwoot support per licensee.",
  },
  "/company": {
    title: "Company",
    subtitle: "Licensed organization — profile, locations, suites, and company context.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Account, team permissions, integrations, and platform operator controls.",
  },
  "/workers": {
    title: "LiNKbots",
    subtitle: "Directory of LiNKbots — registry status, presence, and project involvement.",
  },
  "/linkapps/factory": {
    title: "LiNKapps App Factory",
    subtitle: "Blueprint intake, squad monitor, capability leases, and handoff outputs (fixture-only MVO scaffold).",
  },
  "/devtools/mvo-proof": {
    title: "MVO Proof Surfaces",
    subtitle: "Deterministic proof snapshots for browser QA — no live integrations or side effects.",
  },
  "/memory/company-structure": {
    title: "Org Scope",
    subtitle: "Organisation tags for scoping company memory — moved to LiNKbrain → Org Scope.",
  },
  "/traces": {
    title: "System Logs",
    subtitle: "Recent trace events for debugging and audit review.",
  },
  "/gateway": {
    title: "Integration Routing",
    subtitle: "Channel and gateway routing configuration.",
  },
};

const SETTINGS_SUBPAGE: Record<string, ShellPageMeta> = {
  "/settings/user": {
    title: "User",
    subtitle: "Human operator identity and profile for this workspace.",
  },
  "/settings/billing": {
    title: "Billing",
    subtitle: "Payment methods, LiNKaios subscription, suite licenses, and invoices.",
  },
  "/settings/support": {
    title: "Support",
    subtitle: "Ticket history and escalation — backed by Chatwoot (link-chatwoot) when the connector is live.",
  },
  "/settings/access": {
    title: "User roles & permissions",
    subtitle: "Client workspace Admins assign roles and review what Admin, Operator, and Viewer can do.",
  },
  "/settings/login-credentials": {
    title: "Login credentials",
    subtitle: "Choose and configure how you sign in — password, magic link, or passkey.",
  },
  "/settings/two-factor": {
    title: "Two-factor authentication",
    subtitle: "Add and manage an authenticator app and backup codes for your operator account.",
  },
  "/settings/sessions": {
    title: "Session & activity logs",
    subtitle: "Your active sign-in sessions, devices, locations, and security activity history.",
  },
  "/settings/locale": {
    title: "Locale",
    subtitle: "Language, currency, measurement system, and regional formatting defaults.",
  },
  "/settings/appearance": {
    title: "Theme & appearance",
    subtitle: "Built-in light and dark themes plus custom toolbar icons for your operator account.",
  },
  "/settings/notifications": {
    title: "Notification preferences",
    subtitle: "Email, in-app, and push notification settings by category.",
  },
  "/settings/privacy": {
    title: "Privacy settings",
    subtitle: "Data sharing, analytics, crash reports, and optional marketing communications.",
  },
  "/settings/data-export": {
    title: "Data export",
    subtitle: "Export a portable copy of your workspace data.",
  },
  "/settings/data-settings": {
    title: "Data settings",
    subtitle: "Data retention policy, scheduled backups, and restore points.",
  },
  "/settings/integrations": {
    title: "Integrations",
    subtitle: "Supported capabilities and requests for software not yet available.",
  },
  "/settings/api-keys": {
    title: "API access",
    subtitle: "API keys, tokens, and login secrets from external providers (LLMs, banks, CRMs, software) used by LiNKaios.",
  },
  "/settings/traces": {
    title: "System Logs",
    subtitle: "Trace runs, payloads, and diagnostics for operators.",
  },
  "/settings/governance": {
    title: "Governance Preview",
    subtitle: "Development-only JSON preview for governance configuration.",
  },
  "/settings/platform": {
    title: "Platform",
    subtitle: "Power-operator areas — routing, traces, LiNKguard cleanup, and development proof surfaces.",
  },
  "/settings/linkguard": {
    title: "LiNKguard",
    subtitle: "Automated cleanup worker health and recent activity from the LiNKguard sidecar.",
  },
  "/settings/tools": {
    title: "Tool Permissions",
    subtitle: "Organisation-scoped defaults for which tools LiNKbots may call.",
  },
  "/settings/gateway": {
    title: "Integration Routing",
    subtitle: "Channel and gateway routing for inbound and outbound capabilities.",
  },
};

const PREFIX: { prefix: string; meta: ShellPageMeta }[] = [
  {
    prefix: "/suites/",
    meta: {
      title: "Suites",
      subtitle: "Subscribed product suites, module catalogues, and projects.",
    },
  },
  {
    prefix: "/skills/",
    meta: {
      title: "LiNKskills",
      subtitle: "Skills, tools, scripts, and certification for governed execution.",
    },
  },
  {
    prefix: "/memory/",
    meta: {
      title: "LiNKbrain",
      subtitle: "Memory files, drafts, and scoped retrieval for this area.",
    },
  },
];

const SEGMENT_LABELS: Record<string, string> = {
  work: "Work",
  alerts: "Alerts",
  messages: "Messages",
  sessions: "Sessions",
  workers: "LiNKbots",
  projects: "Projects",
  skills: "LiNKskills",
  memory: "LiNKbrain",
  modules: "Suites",
  suites: "Suites",
  metrics: "Metrics",
  company: "Company",
  settings: "Settings",
  gateway: "Integration routing",
  traces: "System logs",
  user: "User",
  access: "Access",
  governance: "Governance",
  advanced: "Platform",
  platform: "Platform",
  privacy: "Privacy & Data",
  "data-export": "Data export",
  "data-settings": "Data settings",
  integrations: "Integrations",
  "api-keys": "API access",
  brain: "LiNKbrain",
  models: "Models",
  tools: "Tools",
  devtools: "Devtools",
  "mvo-proof": "MVO proof surfaces",
  linkapps: "LiNKapps",
  factory: "App factory",
};

/** Settings sub-routes (not the hub) — rendered by `SettingsLayoutChrome`. */
export function resolveSettingsSubpageMeta(pathname: string): ShellPageMeta | null {
  if (pathname === "/settings" || pathname === "/settings/") return null;
  if (!pathname.startsWith("/settings/")) return null;
  const exact = SETTINGS_SUBPAGE[pathname];
  if (exact) return exact;
  const leaf = pathname.split("/").filter(Boolean).pop() ?? "Settings";
  const title = SEGMENT_LABELS[leaf] ?? leaf.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title,
    subtitle: `${title} — workspace settings.`,
  };
}

function shellRoutePath(pathname: string): string {
  const route = stripAppBasePath(pathname);
  if (route === "/admin" || route === "/admin/") return "/";
  return route;
}

/** Routes that render their own page header inside page content or a section layout. */
export function suppressesAutoShellPageHeader(pathname: string): boolean {
  const route = shellRoutePath(pathname);
  if (route === "/" || route === "/client" || route === "/client/" || route === "/app" || route === "/app/") return true;
  if (route === "/work" || route.startsWith("/work/")) return true;
  if (/^\/workers\/[^/]+/.test(route)) return true;
  if (route === "/workers") return true;
  if (route === "/projects") return true;
  if (route.startsWith("/projects/")) return true;
  if (route === "/skills" || route.startsWith("/skills/")) return true;
  if (route === "/memory" || route.startsWith("/memory/")) return true;
  if (route === "/suites" || route.startsWith("/suites/")) return true;
  if (route === "/metrics") return true;
  if (route === "/company" || route.startsWith("/company/")) return true;
  if (route === "/licensees" || route.startsWith("/licensees/")) return true;
  if (route === "/settings" || route.startsWith("/settings/")) return true;
  if (route === "/linkapps" || route.startsWith("/linkapps/")) return true;
  if (route === "/devtools" || route.startsWith("/devtools/")) return true;
  return false;
}

export function resolveShellPageMeta(pathname: string): ShellPageMeta | null {
  if (suppressesAutoShellPageHeader(pathname)) return null;

  const route = shellRoutePath(pathname);
  const exact = EXACT[route];
  if (exact) return exact;

  for (const row of PREFIX) {
    if (route.startsWith(row.prefix)) return row.meta;
  }

  const parts = route.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const leaf = parts[parts.length - 1]!;
  const title = SEGMENT_LABELS[leaf] ?? leaf.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title,
    subtitle: `${title} — LiNKaios operator view.`,
  };
}
