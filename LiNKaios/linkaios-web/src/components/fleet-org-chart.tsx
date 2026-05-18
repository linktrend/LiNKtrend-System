"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import type { FleetOrgEdge, FleetOrgNode, OrgChartIcon } from "@/lib/fleet-org-chart-layout";

const W = 1000;
const H = 560;

function IconGlyph(props: { kind: OrgChartIcon; className?: string }) {
  const cn =
    props.className ?? "h-5 w-5 text-zinc-500 dark:text-zinc-300";
  switch (props.kind) {
    case "crown":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M4 10l2.5 8h11L20 10l-4 2-4-6-4 6-4-2z" />
        </svg>
      );
    case "globe":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a16 16 0 000 18" />
        </svg>
      );
    case "chip":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="7" y="7" width="10" height="10" rx="2" />
          <path d="M7 11H4M20 11h-3M7 13H4M20 13h-3M11 7V4M13 7V4M11 20v-3M13 20v-3" />
        </svg>
      );
    case "code":
    default:
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 7l-2 10" />
        </svg>
      );
  }
}

function kindFrame(kind: FleetOrgNode["kind"]): string {
  if (kind === "role") return "shadow-md shadow-violet-200/40 ring-2 ring-violet-400 dark:ring-violet-500";
  if (kind === "team") return "border-2 border-dashed border-sky-400 dark:border-sky-500";
  return "ring-2 ring-teal-400 dark:ring-teal-500";
}

function kindLabel(kind: FleetOrgNode["kind"]): string {
  if (kind === "role") return "Role";
  if (kind === "team") return "Team";
  return "Agent";
}

function OrgCard(props: { node: FleetOrgNode }) {
  const n = props.node;
  const body = (
    <div
      className={`w-[200px] rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-600 dark:bg-zinc-900 ${kindFrame(n.kind)}`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 rounded-md bg-zinc-100 p-1.5 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-600">
          <IconGlyph kind={n.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{kindLabel(n.kind)}</p>
          <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">{n.title}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400">{n.subtitle}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300">
            <span className={n.dot === "emerald" ? "h-1.5 w-1.5 rounded-full bg-emerald-500" : "h-1.5 w-1.5 rounded-full bg-amber-500"} />
            <span className="truncate">{n.badge}</span>
          </p>
        </div>
      </div>
    </div>
  );

  if (n.href) {
    return (
      <Link
        href={n.href}
        className="block outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-zinc-400 dark:ring-offset-black dark:focus-visible:ring-zinc-500"
      >
        {body}
      </Link>
    );
  }
  return <div className="cursor-default opacity-95">{body}</div>;
}

function edgePath(nodes: FleetOrgNode[], e: FleetOrgEdge): string {
  const a = nodes.find((x) => x.id === e.from);
  const b = nodes.find((x) => x.id === e.to);
  if (!a || !b) return "";
  const x1 = a.x;
  const y1 = a.y + 58;
  const x2 = b.x;
  const y2 = b.y - 58;
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
}

export function FleetOrgChart(props: { nodes: FleetOrgNode[]; edges: FleetOrgEdge[] }) {
  const [scale, setScale] = useState(1);

  const paths = useMemo(() => props.edges.map((e) => edgePath(props.nodes, e)).filter(Boolean), [props.edges, props.nodes]);

  const zoomIn = useCallback(() => setScale((s) => Math.min(1.6, s + 0.12)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.55, s - 0.12)), []);
  const fit = useCallback(() => setScale(1), []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-inner dark:border-zinc-800 dark:bg-black">
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white/95 p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950/95">
        <button
          type="button"
          onClick={zoomIn}
          className="rounded px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="rounded px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          −
        </button>
        <button
          type="button"
          onClick={fit}
          className="rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Fit
        </button>
      </div>

      <div className="min-h-[520px] overflow-auto p-4">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
          Org chart
        </p>
        <div
          className="mx-auto origin-top transition-transform duration-200 ease-out"
          style={{ width: W, height: H, transform: `scale(${scale})` }}
        >
          <div className="relative" style={{ width: W, height: H }}>
            <svg
              className="pointer-events-none absolute inset-0 text-zinc-300 dark:text-zinc-600"
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              aria-hidden
            >
              {paths.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1.25" opacity={0.55} />
              ))}
            </svg>
            {props.nodes.map((n) => (
              <div key={n.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: n.x, top: n.y }}>
                <OrgCard node={n} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
