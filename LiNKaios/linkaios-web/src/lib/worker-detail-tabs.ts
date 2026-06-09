export type WorkerDetailTabId =
  | "sessions"
  | "projects"
  | "skills"
  | "brain"
  | "models"
  | "settings"
  | "logs"
  | "lifecycle"
  | "native-ui";

export const WORKER_DETAIL_TABS: {
  id: WorkerDetailTabId;
  label: string;
  href: (agentId: string) => string;
  match: (path: string, agentId: string) => boolean;
}[] = [
  {
    id: "sessions",
    label: "Sessions",
    href: (id) => `/workers/${id}/sessions`,
    match: (path, id) =>
      path === `/workers/${id}/sessions` || path === `/workers/${id}` || path.startsWith(`/workers/${id}/sessions/`),
  },
  {
    id: "projects",
    label: "Projects",
    href: (id) => `/workers/${id}/projects`,
    match: (path, id) => path.startsWith(`/workers/${id}/projects`),
  },
  {
    id: "skills",
    label: "LiNKskills",
    href: (id) => `/workers/${id}/skills`,
    match: (path, id) => path.startsWith(`/workers/${id}/skills`),
  },
  {
    id: "brain",
    label: "LiNKbrain",
    href: (id) => `/workers/${id}/brain`,
    match: (path, id) => path.startsWith(`/workers/${id}/brain`),
  },
  {
    id: "models",
    label: "Models",
    href: (id) => `/workers/${id}/models`,
    match: (path, id) => path.startsWith(`/workers/${id}/models`),
  },
  {
    id: "settings",
    label: "Settings",
    href: (id) => `/workers/${id}/settings`,
    match: (path, id) => path.startsWith(`/workers/${id}/settings`),
  },
  {
    id: "logs",
    label: "Logs",
    href: (id) => `/workers/${id}/logs`,
    match: (path, id) => path.startsWith(`/workers/${id}/logs`),
  },
  {
    id: "lifecycle",
    label: "Lifecycle",
    href: (id) => `/workers/${id}/lifecycle`,
    match: (path, id) => path.startsWith(`/workers/${id}/lifecycle`),
  },
  {
    id: "native-ui",
    label: "Native UI",
    href: (id) => `/workers/${id}/native-ui`,
    match: (path, id) => path.startsWith(`/workers/${id}/native-ui`),
  },
];

export function resolveWorkerDetailTab(pathname: string, agentId: string): (typeof WORKER_DETAIL_TABS)[number] | null {
  return WORKER_DETAIL_TABS.find((tab) => tab.match(pathname, agentId)) ?? null;
}

export function workerDetailTabsForSurface(options: {
  isAdminSurface: boolean;
  showProjectsOnAdmin: boolean;
}): typeof WORKER_DETAIL_TABS {
  return WORKER_DETAIL_TABS.filter((tab) => {
    if (tab.id === "lifecycle") return false;
    if (tab.id !== "projects") return true;
    if (!options.isAdminSurface) return true;
    return options.showProjectsOnAdmin;
  });
}
