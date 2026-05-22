"use client";

import { useCallback, useEffect, useState } from "react";

import type { OrgDepartmentFixture } from "@/lib/company-fixtures";
import {
  EVENT_COMPANY_PEOPLE_CHANGED,
  companyPersonDisplayName,
  officerRoleLabel,
  readCompanyPeople,
  type CompanyPeopleState,
} from "@/lib/company-people";
import type { CorporateProfileFixture } from "@/lib/company-fixtures";

function PersonNode(props: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-center text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
      <p className="font-medium text-zinc-900 dark:text-zinc-100">{props.title}</p>
      {props.subtitle ? <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">{props.subtitle}</p> : null}
    </div>
  );
}

export function CompanyPeopleOrgChart(props: {
  companyId: string;
  companyName: string;
  seedProfile: CorporateProfileFixture;
  departments: OrgDepartmentFixture[];
}) {
  const [people, setPeople] = useState<CompanyPeopleState>(() => readCompanyPeople(props.companyId, props.seedProfile));

  const sync = useCallback(() => {
    setPeople(readCompanyPeople(props.companyId, props.seedProfile));
  }, [props.companyId, props.seedProfile]);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT_COMPANY_PEOPLE_CHANGED, sync);
    return () => window.removeEventListener(EVENT_COMPANY_PEOPLE_CHANGED, sync);
  }, [sync]);

  const deptByLocation = new Map<string, OrgDepartmentFixture[]>();
  for (const dept of props.departments) {
    const list = deptByLocation.get(dept.location) ?? [];
    list.push(dept);
    deptByLocation.set(dept.location, list);
  }

  const hasPeople =
    people.directors.length > 0 || people.officers.length > 0 || props.departments.some((dept) => dept.lead.trim());

  if (!hasPeople) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">No people recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex min-w-[32rem] flex-col items-center gap-4">
        <div className="rounded-lg border border-sky-200 bg-white px-4 py-2 text-center text-sm font-semibold text-sky-900 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100">
          {props.companyName}
        </div>

        {people.directors.length > 0 ? (
          <div className="w-full space-y-2">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Directors</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {people.directors.map((director) => (
                <PersonNode
                  key={director.id}
                  title={companyPersonDisplayName(director)}
                  subtitle="Director"
                />
              ))}
            </div>
          </div>
        ) : null}

        {people.officers.length > 0 ? (
          <div className="w-full space-y-2">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Officers</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {people.officers.map((officer) => (
                <PersonNode
                  key={officer.id}
                  title={companyPersonDisplayName(officer)}
                  subtitle={officerRoleLabel(officer)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {deptByLocation.size > 0 ? (
          <div className="w-full space-y-3">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Department leads
            </p>
            <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...deptByLocation.entries()].map(([location, depts]) => (
                <div key={location} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{location}</p>
                  <ul className="mt-2 space-y-2">
                    {depts.map((dept) => (
                      <li key={dept.id}>
                        <PersonNode title={dept.lead || "—"} subtitle={dept.department} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
