/** Title + subtitle for shared shell page headers (breadcrumb leaf = title). */

export type ShellPageMeta = {
  title: string;
  subtitle: string;
};

const EXACT: Record<string, ShellPageMeta> = {
  "/projects/new": {
    title: "New Project",
    subtitle: "Choose a governed project type — each type defines the processes and workflows for this work.",
  },
  "/memory": {
    title: "LiNKbrain",
    subtitle: "Institutional memory — inbox, project context, agent notes, and company knowledge.",
  },
  "/skills": {
    title: "LiNKskills",
    subtitle: "Company skill and tool catalog — what LiNKbots may run under governance.",
  },
  "/modules": {
    title: "Modules",
    subtitle: "Tenant-enabled business packages and how they connect to projects.",
  },
  "/metrics": {
    title: "Metrics",
    subtitle: "Performance observability — cost, tokens, run time, success/failure, and usage by project, LiNKbot, model, tool, and skill.",
  },
  "/cockpit": {
    title: "Cockpit",
    subtitle: "Cross-plane operations — module health, workflow runs, and system status (leases live under LiNKskills).",
  },
  "/company": {
    title: "Company",
    subtitle: "Licensed organization — profile, locations, modules, and company context.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Account, access, integrations, and advanced operator controls.",
  },
  "/workers": {
    title: "LiNKbots",
    subtitle: "Directory of LiNKbots — registry status, presence, and project involvement.",
  },
  "/traces": {
    title: "System logs",
    subtitle: "Recent trace events for debugging and audit review.",
  },
  "/gateway": {
    title: "Integration routing",
    subtitle: "Channel and gateway routing configuration.",
  },
};

const PREFIX: { prefix: string; meta: ShellPageMeta }[] = [
  {
    prefix: "/settings/",
    meta: {
      title: "Settings",
      subtitle: "Account, access, integrations, and advanced operator controls.",
    },
  },
  {
    prefix: "/cockpit/",
    meta: {
      title: "Cockpit",
      subtitle: "Cross-plane operations — module health, workflow runs, and system status.",
    },
  },
  {
    prefix: "/modules/",
    meta: {
      title: "Modules",
      subtitle: "Tenant-enabled business packages and project types.",
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
  modules: "Modules",
  metrics: "Metrics",
  cockpit: "Cockpit",
  company: "Company",
  settings: "Settings",
  gateway: "Integration routing",
  traces: "System logs",
  user: "User",
  access: "Access",
  governance: "Governance",
  advanced: "Advanced",
  brain: "LiNKbrain",
  models: "Models",
  tools: "Tools",
};

/** Routes that render their own page header inside page content. */
export function suppressesAutoShellPageHeader(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/work" || pathname.startsWith("/work/")) return true;
  if (/^\/workers\/[^/]+/.test(pathname)) return true;
  if (pathname === "/projects") return true;
  if (pathname.startsWith("/projects/") && pathname !== "/projects/new") return true;
  if (pathname === "/skills" || pathname.startsWith("/skills/")) return true;
  if (pathname === "/memory" || pathname.startsWith("/memory/")) return true;
  if (pathname === "/modules" || pathname.startsWith("/modules/")) return true;
  if (pathname === "/metrics") return true;
  if (pathname === "/company" || pathname.startsWith("/company/")) return true;
  return false;
}

export function resolveShellPageMeta(pathname: string): ShellPageMeta | null {
  if (suppressesAutoShellPageHeader(pathname)) return null;

  const exact = EXACT[pathname];
  if (exact) return exact;

  for (const row of PREFIX) {
    if (pathname.startsWith(row.prefix)) return row.meta;
  }

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const leaf = parts[parts.length - 1]!;
  const title = SEGMENT_LABELS[leaf] ?? leaf.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title,
    subtitle: `${title} — LiNKaios operator view.`,
  };
}
