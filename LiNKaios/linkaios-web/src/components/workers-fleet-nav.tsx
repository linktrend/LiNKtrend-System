import Link from "next/link";

import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

const VIEWS = ["list", "grid", "org"] as const;
export type FleetView = (typeof VIEWS)[number];

const LABELS: Record<FleetView, string> = {
  list: "List",
  grid: "Grid",
  org: "Org",
};

export function WorkersFleetNav(props: { current: FleetView; scope?: WorkersFleetScope }) {
  const scopeQuery = workersFleetScopeQuery(props.scope ?? "all");
  return (
    <nav aria-label="LiNKbots views" className={`${TABS.row} mt-6`}>
      {VIEWS.map((v) => {
        const active = props.current === v;
        const href =
          v === "list"
            ? `/workers${scopeQuery}`
            : `/workers${scopeQuery}${scopeQuery ? "&" : "?"}view=${v}`;
        return (
          <Link key={v} href={href} className={screenTabLinkClass(active)}>
            {LABELS[v]}
          </Link>
        );
      })}
    </nav>
  );
}

export function parseFleetView(raw: string | string[] | undefined): FleetView {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "grid" || v === "org") return v;
  return "list";
}

/** Admin LiNKbots registry scope — distinct from presence filter pills on the list page. */
export type WorkersFleetScope = "all" | "admin";

export function parseWorkersFleetScope(raw: string | string[] | undefined): WorkersFleetScope {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase();
  return v === "admin" ? "admin" : "all";
}

export function workersFleetScopeQuery(scope: WorkersFleetScope): string {
  return scope === "admin" ? "?scope=admin" : "";
}

export type FleetPresenceFilter = "all" | "active" | "inactive" | "online" | "busy" | "idle";

export function parseFleetPresenceFilter(raw: string | string[] | undefined): FleetPresenceFilter {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase();
  if (v === "active" || v === "inactive" || v === "online" || v === "busy" || v === "idle") return v;
  return "all";
}

const pill = "inline-flex min-w-[6.5rem] shrink-0 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold transition";

export function FleetPresenceFilterBar(props: {
  current: FleetPresenceFilter;
  view: FleetView;
  scope?: WorkersFleetScope;
}) {
  const scopeQuery = workersFleetScopeQuery(props.scope ?? "all");
  const base =
    props.view === "list" ? `/workers${scopeQuery}` : `/workers${scopeQuery}${scopeQuery ? "&" : "?"}view=${props.view}`;
  const items: { id: FleetPresenceFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "online", label: "Online" },
    { id: "busy", label: "Busy" },
    { id: "idle", label: "Idle" },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((it) => {
        const active = props.current === it.id;
        const href =
          it.id === "all"
            ? base
            : `${base}${base.includes("?") ? "&" : "?"}filter=${encodeURIComponent(it.id)}`;
        return (
          <Link
            key={it.id}
            href={href}
            className={
              pill +
              (active
                ? " bg-zinc-900 text-white ring-1 ring-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-100"
                : " bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300 hover:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600 dark:hover:ring-zinc-500")
            }
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
