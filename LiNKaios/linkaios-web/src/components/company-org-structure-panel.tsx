"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Network, Users } from "lucide-react";

import { CompanyEditableCard } from "@/components/company-editable-card";
import { CompanyFormGridHeader, CompanyFormGridRow } from "@/components/company-form-fields";
import { CompanyPeopleOrgChart } from "@/components/company-people-org-chart";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import {
  corporateProfileForCompany,
  orgStructureForCompany,
  resolveCompanyFixture,
  type OrgDepartmentFixture,
} from "@/lib/company-fixtures";
import { FIELD } from "@/lib/ui-standards";

function CompanyOrgChartPreview(props: { departments: OrgDepartmentFixture[]; companyName: string }) {
  const byLocation = new Map<string, OrgDepartmentFixture[]>();
  for (const d of props.departments) {
    const list = byLocation.get(d.location) ?? [];
    list.push(d);
    byLocation.set(d.location, list);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex min-w-[32rem] flex-col items-center gap-4">
        <div className="rounded-lg border border-violet-200 bg-white px-4 py-2 text-center text-sm font-semibold text-violet-900 shadow-sm dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-100">
          {props.companyName}
        </div>
        <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...byLocation.entries()].map(([location, depts]) => (
            <div key={location} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{location}</p>
              <ul className="mt-2 space-y-2">
                {depts.map((d) => (
                  <li key={d.id} className="rounded-md border border-zinc-100 bg-zinc-50 px-2 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{d.department}</p>
                    <p className="text-zinc-600 dark:text-zinc-400">{d.lead}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CompanyOrgStructurePanel() {
  const searchParams = useSearchParams();
  const company = resolveCompanyFixture(searchParams.get("companyId"));
  const seedProfile = useMemo(() => corporateProfileForCompany(company.id), [company.id]);
  const seed = useMemo(() => orgStructureForCompany(company.id), [company.id]);
  const [departments, setDepartments] = useState(seed.departments);
  const [draftDept, setDraftDept] = useState<OrgDepartmentFixture[]>(seed.departments);

  useEffect(() => {
    const next = orgStructureForCompany(company.id);
    setDepartments(next.departments);
    setDraftDept(next.departments);
  }, [company.id]);

  return (
    <div className="space-y-4">
      <CompanyEditableCard
        icon={Network}
        title="Company organisation chart"
        description="Locations, departments, and reporting structure for this company."
      >
        <CompanyOrgChartPreview departments={departments} companyName={company.displayName} />
      </CompanyEditableCard>

      <CompanyEditableCard
        icon={Users}
        title="People organisation chart"
        description="Directors, officers, and department leads. Edit people on Overview; edit department leads below."
      >
        <CompanyPeopleOrgChart
          companyId={company.id}
          companyName={company.displayName}
          seedProfile={seedProfile}
          departments={departments}
        />
      </CompanyEditableCard>

      <CompanyEditableCard
        icon={MapPin}
        title="Departments by location"
        description="Key people and headcount per department."
        required
        editContent={
          <div className="space-y-3">
            <CompanyFormGridHeader labels={["Location", "Department", "Lead", "Headcount"]} columnsClassName="sm:grid-cols-4" />
            {draftDept.map((d, idx) => (
              <CompanyFormGridRow key={d.id} columnsClassName="sm:grid-cols-4">
                <input
                  value={d.location}
                  onChange={(e) => {
                    const next = [...draftDept];
                    next[idx] = { ...d, location: e.target.value };
                    setDraftDept(next);
                  }}
                  className={FIELD.controlFull}
                  placeholder="Location"
                  aria-label={`Department location ${idx + 1}`}
                />
                <input
                  value={d.department}
                  onChange={(e) => {
                    const next = [...draftDept];
                    next[idx] = { ...d, department: e.target.value };
                    setDraftDept(next);
                  }}
                  className={FIELD.controlFull}
                  placeholder="Department"
                  aria-label={`Department name ${idx + 1}`}
                />
                <input
                  value={d.lead}
                  onChange={(e) => {
                    const next = [...draftDept];
                    next[idx] = { ...d, lead: e.target.value };
                    setDraftDept(next);
                  }}
                  className={FIELD.controlFull}
                  placeholder="Lead"
                  aria-label={`Department lead ${idx + 1}`}
                />
                <input
                  type="number"
                  value={d.headcount}
                  onChange={(e) => {
                    const next = [...draftDept];
                    next[idx] = { ...d, headcount: Number(e.target.value) || 0 };
                    setDraftDept(next);
                  }}
                  className={FIELD.controlFull}
                  placeholder="Headcount"
                  aria-label={`Department headcount ${idx + 1}`}
                />
              </CompanyFormGridRow>
            ))}
          </div>
        }
        onSave={() => setDepartments(draftDept)}
      >
        <DataTableShell>
          <DataTable>
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[28%]" />
              <col className="w-[28%]" />
              <col className="w-[22%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>Location</th>
                <th className={DT.thTextInset}>Department</th>
                <th className={DT.thTextInset}>Lead</th>
                <th className={DT.thTextInset}>Headcount</th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {departments.map((d) => (
                <DataTableRow key={d.id}>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{d.location}</span>
                  </td>
                  <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                    <span className={DT.tdTextSpan}>{d.department}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan}>{d.lead}</span>
                  </td>
                  <td className={`${DT.tdClipInset} tabular-nums`}>
                    <span className={DT.tdTextSpan}>{d.headcount}</span>
                  </td>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </CompanyEditableCard>
    </div>
  );
}
