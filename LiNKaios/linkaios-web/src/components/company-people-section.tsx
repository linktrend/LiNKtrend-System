"use client";

import { useCallback, useEffect, useState } from "react";
import { PieChart, Shield, Users } from "lucide-react";

import { CompanyEditableCard } from "@/components/company-editable-card";
import { CompanyFieldGrid } from "@/components/company-form-fields";
import { FormSelect } from "@/components/forms";
import {
  CompanyDirectorFields,
  CompanyOfficerFields,
  CompanyShareholderFields,
} from "@/components/company-person-fields";
import type { CorporateProfileFixture } from "@/lib/company-fixtures";
import {
  COMPANY_OFFICER_COUNT_OPTIONS,
  COMPANY_PEOPLE_COUNT_OPTIONS,
  EVENT_COMPANY_PEOPLE_CHANGED,
  companyPersonAddressLine,
  companyPersonDisplayName,
  companyPersonPhoneLine,
  emptyDirector,
  emptyOfficer,
  emptyShareholder,
  officerRoleLabel,
  readCompanyPeople,
  resizePeopleList,
  shareholderOwnershipTotal,
  writeCompanyPeople,
  type CompanyDirector,
  type CompanyOfficer,
  type CompanyPeopleState,
  type CompanyShareholder,
} from "@/lib/company-people";
import { COMPANY_FORM_ROW } from "@/lib/ui-standards";

function CountSelect(props: {
  id: string;
  label: string;
  value: number;
  options: readonly number[];
  onChange: (count: number) => void;
}) {
  return (
    <div className={COMPANY_FORM_ROW}>
      <label htmlFor={props.id} className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {props.label}
      </label>
      <FormSelect
        id={props.id}
        count
        value={String(props.value)}
        onChange={(value) => props.onChange(Number(value))}
        options={props.options.map((option) => ({ value: String(option), label: String(option) }))}
      />
    </div>
  );
}

function PersonSummaryCard(props: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{props.title}</h4>
      <div className="mt-3">
        <CompanyFieldGrid dense rows={props.rows} />
      </div>
    </article>
  );
}

function directorSummaryRows(director: CompanyDirector) {
  return [
    { label: "Name", value: companyPersonDisplayName(director) },
    { label: "Title", value: "Director" },
    { label: "Address", value: companyPersonAddressLine(director) },
    { label: "Phone", value: companyPersonPhoneLine(director) },
    { label: "Email", value: director.email },
  ];
}

function directorCardTitle(director: CompanyDirector, index: number): string {
  const name = companyPersonDisplayName(director);
  return name !== "—" ? `${name} · Director` : `Director ${index + 1}`;
}

function officerSummaryRows(officer: CompanyOfficer) {
  return [
    { label: "Name", value: companyPersonDisplayName(officer) },
    { label: "Title", value: officerRoleLabel(officer) },
    { label: "Address", value: companyPersonAddressLine(officer) },
    { label: "Phone", value: companyPersonPhoneLine(officer) },
    { label: "Email", value: officer.email },
  ];
}

function shareholderSummaryRows(shareholder: CompanyShareholder) {
  return [
    { label: "Name", value: companyPersonDisplayName(shareholder) },
    { label: "Title", value: "Shareholder" },
    { label: "Ownership", value: `${shareholder.ownershipPercent}%` },
    { label: "Address", value: companyPersonAddressLine(shareholder) },
    { label: "Phone", value: companyPersonPhoneLine(shareholder) },
    { label: "Email", value: shareholder.email },
  ];
}

export function CompanyPeopleSection(props: { companyId: string; seedProfile: CorporateProfileFixture }) {
  const [people, setPeople] = useState<CompanyPeopleState>(() =>
    readCompanyPeople(props.companyId, props.seedProfile),
  );
  const [draft, setDraft] = useState<CompanyPeopleState>(() => readCompanyPeople(props.companyId, props.seedProfile));

  const syncFromStorage = useCallback(() => {
    const next = readCompanyPeople(props.companyId, props.seedProfile);
    setPeople(next);
    setDraft(next);
  }, [props.companyId, props.seedProfile]);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ companyId: string }>).detail;
      if (detail?.companyId === props.companyId) syncFromStorage();
    };
    window.addEventListener(EVENT_COMPANY_PEOPLE_CHANGED, onChange);
    return () => window.removeEventListener(EVENT_COMPANY_PEOPLE_CHANGED, onChange);
  }, [props.companyId, syncFromStorage]);

  function persist(next: CompanyPeopleState) {
    writeCompanyPeople(props.companyId, next);
    setPeople(next);
    setDraft(next);
  }

  function saveDirectors() {
    persist({
      ...people,
      directors: draft.directors.map((director) => ({ ...director, directorTitle: "Director" })),
    });
  }

  function saveOfficers() {
    persist({ ...people, officers: draft.officers });
  }

  function saveShareholders() {
    persist({ ...people, shareholders: draft.shareholders });
  }

  const ownershipTotal = shareholderOwnershipTotal(draft.shareholders);

  return (
    <div className="space-y-4">
      <CompanyEditableCard
        icon={Users}
        title="Directors"
        description="Board directors with contact and address details."
        required
        onEditStart={() => setDraft((current) => ({ ...current, directors: structuredClone(people.directors) }))}
        onCancelEdit={() => setDraft((current) => ({ ...current, directors: structuredClone(people.directors) }))}
        onSave={saveDirectors}
        editContent={
          <div className="space-y-4">
            <CountSelect
              id="director-count"
              label="Number of directors"
              value={draft.directors.length}
              options={COMPANY_PEOPLE_COUNT_OPTIONS}
              onChange={(count) =>
                setDraft((current) => ({
                  ...current,
                  directors: resizePeopleList(current.directors, count, () => ({ ...emptyDirector(), directorTitle: "Director" })),
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {draft.directors.map((director, index) => (
                <CompanyDirectorFields
                  key={director.id}
                  director={director}
                  index={index}
                  onChange={(next) =>
                    setDraft((current) => ({
                      ...current,
                      directors: current.directors.map((row, rowIndex) =>
                        rowIndex === index ? { ...next, directorTitle: "Director" } : row,
                      ),
                    }))
                  }
                />
              ))}
            </div>
          </div>
        }
      >
        {people.directors.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No directors recorded.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {people.directors.map((director, index) => (
              <PersonSummaryCard key={director.id} title={directorCardTitle(director, index)} rows={directorSummaryRows(director)} />
            ))}
          </div>
        )}
      </CompanyEditableCard>

      <CompanyEditableCard
        icon={Shield}
        title="Officers"
        description="Company secretary, CEO, CFO, and other statutory officers."
        required
        onEditStart={() => setDraft((current) => ({ ...current, officers: structuredClone(people.officers) }))}
        onCancelEdit={() => setDraft((current) => ({ ...current, officers: structuredClone(people.officers) }))}
        onSave={saveOfficers}
        editContent={
          <div className="space-y-4">
            <CountSelect
              id="officer-count"
              label="Number of officers"
              value={draft.officers.length}
              options={COMPANY_OFFICER_COUNT_OPTIONS}
              onChange={(count) =>
                setDraft((current) => ({
                  ...current,
                  officers: resizePeopleList(current.officers, count, () => emptyOfficer("secretary")),
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {draft.officers.map((officer, index) => (
                <CompanyOfficerFields
                  key={officer.id}
                  officer={officer}
                  index={index}
                  onChange={(next) =>
                    setDraft((current) => ({
                      ...current,
                      officers: current.officers.map((row, rowIndex) => (rowIndex === index ? next : row)),
                    }))
                  }
                />
              ))}
            </div>
          </div>
        }
      >
        {people.officers.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No officers recorded.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {people.officers.map((officer, index) => (
              <PersonSummaryCard
                key={officer.id}
                title={`${officerRoleLabel(officer)}${companyPersonDisplayName(officer) !== "—" ? ` · ${companyPersonDisplayName(officer)}` : ""}`}
                rows={officerSummaryRows(officer)}
              />
            ))}
          </div>
        )}
      </CompanyEditableCard>

      <CompanyEditableCard
        icon={PieChart}
        title="Shareholders"
        description="Members and ownership percentages — all shareholders must total 100%."
        required
        saveDisabled={draft.shareholders.length > 0 && ownershipTotal !== 100}
        onEditStart={() => setDraft((current) => ({ ...current, shareholders: structuredClone(people.shareholders) }))}
        onCancelEdit={() => setDraft((current) => ({ ...current, shareholders: structuredClone(people.shareholders) }))}
        onSave={saveShareholders}
        editContent={
          <div className="space-y-4">
            <CountSelect
              id="shareholder-count"
              label="Number of shareholders"
              value={draft.shareholders.length}
              options={COMPANY_PEOPLE_COUNT_OPTIONS}
              onChange={(count) =>
                setDraft((current) => ({
                  ...current,
                  shareholders: resizePeopleList(current.shareholders, count, () => emptyShareholder(0)),
                }))
              }
            />
            {draft.shareholders.length > 0 ? (
              <p
                className={`text-sm ${ownershipTotal === 100 ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}
                role="status"
              >
                Total ownership: {ownershipTotal}% {ownershipTotal === 100 ? "" : "(must equal 100% to save)"}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {draft.shareholders.map((shareholder, index) => (
                <CompanyShareholderFields
                  key={shareholder.id}
                  shareholder={shareholder}
                  index={index}
                  onChange={(next) =>
                    setDraft((current) => ({
                      ...current,
                      shareholders: current.shareholders.map((row, rowIndex) => (rowIndex === index ? next : row)),
                    }))
                  }
                />
              ))}
            </div>
          </div>
        }
      >
        {people.shareholders.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No shareholders recorded.</p>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {people.shareholders.map((shareholder, index) => (
                <PersonSummaryCard
                  key={shareholder.id}
                  title={`Shareholder ${index + 1} · ${shareholder.ownershipPercent}%`}
                  rows={shareholderSummaryRows(shareholder)}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Total ownership: {shareholderOwnershipTotal(people.shareholders)}%
            </p>
          </div>
        )}
      </CompanyEditableCard>
    </div>
  );
}
