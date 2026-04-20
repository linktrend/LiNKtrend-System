import Link from "next/link";

import { screenTabLinkClass, TABS } from "@/lib/ui-standards";

const VIEWS = ["list", "grid", "org"] as const;
export type FleetView = (typeof VIEWS)[number];

const LABELS: Record<FleetView, string> = {
  list: "List",
  grid: "Grid",
  org: "Org",
};

export function WorkersFleetNav(props: { current: FleetView }) {
  return (
    <nav aria-label="LiNKbots views" className={`${TABS.row} mt-6`}>
      {VIEWS.map((v) => {
        const active = props.current === v;
        return (
          <Link
            key={v}
            href={v === "list" ? "/workers" : `/workers?view=${v}`}
            className={screenTabLinkClass(active)}
          >
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

export type FleetPresenceFilter = "all" | "active" | "inactive" | "online" | "busy" | "idle";

export function parseFleetPresenceFilter(raw: string | string[] | undefined): FleetPresenceFilter {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase();
  if (v === "active" || v === "inactive" || v === "online" || v === "busy" || v === "idle") return v;
  return "all";
}

export function FleetPresenceFilterBar(props: { current: FleetPresenceFilter; view: FleetView }) {
  const base = props.view === "list" ? "/workers" : `/workers?view=${props.view}`;
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
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
              (active
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-500")
            }
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
