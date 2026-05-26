"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Building2, Crown, User, Users, type LucideIcon } from "lucide-react";

import type { OrgDepartmentFixture } from "@/lib/company-fixtures";
import {
  EVENT_COMPANY_PEOPLE_CHANGED,
  companyPersonDisplayName,
  readCompanyPeople,
  type CompanyPeopleState,
} from "@/lib/company-people";
import {
  buildCompanyPeopleOrgChart,
  type CompanyPeopleOrgNode,
  type CompanyPeopleOrgEdge,
} from "@/lib/company-people-org-chart-layout";
import type { CorporateProfileFixture } from "@/lib/company-fixtures";

const NODE_ICONS: Record<CompanyPeopleOrgNode["kind"], LucideIcon> = {
  company: Building2,
  executive: Crown,
  director: Users,
  officer: Briefcase,
  department: User,
};

function kindFrame(kind: CompanyPeopleOrgNode["kind"]): string {
  if (kind === "company") return "ring-2 ring-zinc-300 dark:ring-zinc-600";
  if (kind === "executive") return "shadow-md shadow-violet-200/40 ring-2 ring-violet-400 dark:ring-violet-500";
  if (kind === "director") return "ring-2 ring-sky-400 dark:ring-sky-500";
  if (kind === "officer") return "ring-2 ring-amber-400 dark:ring-amber-500";
  return "border-2 border-dashed border-teal-400 dark:border-teal-500";
}

function kindLabel(kind: CompanyPeopleOrgNode["kind"]): string {
  if (kind === "company") return "Company";
  if (kind === "executive") return "Executive";
  if (kind === "director") return "Director";
  if (kind === "officer") return "Officer";
  return "Department lead";
}

function OrgPersonCard(props: { node: CompanyPeopleOrgNode }) {
  const Icon = NODE_ICONS[props.node.kind];

  return (
    <div
      className={`w-[176px] rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-lg dark:border-zinc-600 dark:bg-zinc-900 ${kindFrame(props.node.kind)}`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 rounded-md bg-zinc-100 p-1.5 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-600">
          <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-300" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{kindLabel(props.node.kind)}</p>
          <p className="text-sm font-semibold leading-snug tracking-tight text-zinc-900 dark:text-white">{props.node.title}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400">{props.node.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function edgePath(nodes: CompanyPeopleOrgNode[], edge: CompanyPeopleOrgEdge): string {
  const from = nodes.find((node) => node.id === edge.from);
  const to = nodes.find((node) => node.id === edge.to);
  if (!from || !to) return "";
  const x1 = from.x;
  const y1 = from.y + 52;
  const x2 = to.x;
  const y2 = to.y - 52;
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
}

export function CompanyPeopleOrgChart(props: {
  companyId: string;
  companyName: string;
  seedProfile: CorporateProfileFixture;
  departments: OrgDepartmentFixture[];
}) {
  const [people, setPeople] = useState<CompanyPeopleState>(() => readCompanyPeople(props.companyId, props.seedProfile));
  const [scale, setScale] = useState(1);

  const sync = useCallback(() => {
    setPeople(readCompanyPeople(props.companyId, props.seedProfile));
  }, [props.companyId, props.seedProfile]);

  useEffect(() => {
    sync();
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ companyId: string }>).detail;
      if (detail?.companyId === props.companyId) sync();
    };
    window.addEventListener(EVENT_COMPANY_PEOPLE_CHANGED, onChange);
    return () => window.removeEventListener(EVENT_COMPANY_PEOPLE_CHANGED, onChange);
  }, [props.companyId, sync]);

  const chart = useMemo(
    () =>
      buildCompanyPeopleOrgChart({
        companyName: props.companyName,
        people,
        departments: props.departments,
      }),
    [props.companyName, people, props.departments],
  );

  const paths = useMemo(
    () => chart.edges.map((edge) => edgePath(chart.nodes, edge)).filter(Boolean),
    [chart.edges, chart.nodes],
  );

  const zoomIn = useCallback(() => setScale((value) => Math.min(1.6, value + 0.12)), []);
  const zoomOut = useCallback(() => setScale((value) => Math.max(0.55, value - 0.12)), []);
  const fit = useCallback(() => setScale(1), []);

  const hasPeople =
    people.directors.some((director) => companyPersonDisplayName(director) !== "—") ||
    people.officers.some((officer) => companyPersonDisplayName(officer) !== "—") ||
    props.departments.some((dept) => dept.lead.trim());

  if (!hasPeople) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Add directors, officers, and department leads on Overview and below to populate the org chart.
      </p>
    );
  }

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

      <div className="min-h-[320px] overflow-auto p-4">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
          People org chart
        </p>
        <div
          className="mx-auto origin-top transition-transform duration-200 ease-out"
          style={{ width: chart.width, height: chart.height, transform: `scale(${scale})` }}
        >
          <div className="relative" style={{ width: chart.width, height: chart.height }}>
            <svg
              className="pointer-events-none absolute inset-0 text-zinc-300 dark:text-zinc-600"
              width={chart.width}
              height={chart.height}
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              aria-hidden
            >
              {paths.map((path, index) => (
                <path key={index} d={path} fill="none" stroke="currentColor" strokeWidth="1.25" opacity={0.55} />
              ))}
            </svg>
            {chart.nodes.map((node) => (
              <div key={node.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: node.x, top: node.y }}>
                <OrgPersonCard node={node} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
