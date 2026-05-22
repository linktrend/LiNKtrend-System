"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";

import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { FormField, FormSelect, FormTextInput, FormTextarea } from "@/components/forms";
import { TitledCardHeader } from "@/components/titled-card-header";
import { StubPageNotice } from "@/components/stub-badge";
import {
  EVENT_INTEGRATION_REQUESTS_CHANGED,
  readIntegrationRequests,
  submitIntegrationRequest,
  SUPPORTED_INTEGRATIONS,
  type IntegrationRequestRow,
} from "@/lib/integration-requests";
import { BUTTON, formatUiLabel } from "@/lib/ui-standards";

function requestStatusClass(status: IntegrationRequestRow["status"]): string {
  if (status === "planned") return "text-emerald-700 dark:text-emerald-300";
  if (status === "declined") return "text-red-700 dark:text-red-300";
  if (status === "under_review") return "text-amber-700 dark:text-amber-300";
  return "text-zinc-700 dark:text-zinc-300";
}

export function IntegrationsSettingsPage() {
  const [requests, setRequests] = useState<IntegrationRequestRow[]>(() => readIntegrationRequests());
  const [softwareName, setSoftwareName] = useState("");
  const [useCase, setUseCase] = useState("");
  const [priority, setPriority] = useState<IntegrationRequestRow["priority"]>("normal");
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setRequests(readIntegrationRequests());
    sync();
    window.addEventListener(EVENT_INTEGRATION_REQUESTS_CHANGED, sync);
    return () => window.removeEventListener(EVENT_INTEGRATION_REQUESTS_CHANGED, sync);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!softwareName.trim() || !useCase.trim()) return;
    submitIntegrationRequest({ softwareName, useCase, priority });
    setRequests(readIntegrationRequests());
    setSoftwareName("");
    setUseCase("");
    setPriority("normal");
    setFlash("Integration request submitted. The platform team will review your request.");
    window.setTimeout(() => setFlash(null), 4000);
  }

  return (
    <div className="space-y-6">
      <StubPageNotice message="Integration requests are recorded locally for review. No external software is connected from this screen in MVO." />
      {flash ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
        >
          {flash}
        </p>
      ) : null}

      <section className="space-y-4">
        <TitledCardHeader
          icon={Link2}
          title="Supported capabilities"
          description="Software already available as governed LiNKaios capabilities."
        />
        <DataTableShell scrollableBody>
          <DataTable size="sm">
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[34%]" />
              <col className="w-[32%]" />
            </colgroup>
            <DataTableHead bordered>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Software")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Category")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Status")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {SUPPORTED_INTEGRATIONS.map((row) => (
                <DataTableRow key={row.id} compact>
                  <td className={`${DT.tdClipCompactInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                    <span className={DT.tdTextSpan}>{row.name}</span>
                  </td>
                  <td className={DT.tdClipCompactInset}>
                    <span className={DT.tdTextSpan}>{row.category}</span>
                  </td>
                  <td className={DT.tdControlCompact}>
                    <div
                      className={`${DT.controlInner} text-xs font-medium capitalize ${
                        row.status === "available" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {row.status}
                    </div>
                  </td>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <TitledCardHeader
          icon={Link2}
          title="Request a new integration"
          description="Ask for software that is not yet supported as a capability. Include how your team would use it."
        />
        <form onSubmit={submit} className="mt-4 space-y-4">
          <FormField id="integration-software" label="Software name" required>
            {({ id, invalid, describedBy }) => (
              <FormTextInput
                id={id}
                required
                invalid={invalid}
                describedBy={describedBy}
                value={softwareName}
                onChange={setSoftwareName}
                placeholder="e.g. HubSpot, Salesforce, Notion"
              />
            )}
          </FormField>
          <FormField id="integration-use-case" label="Use case" required>
            {({ id, invalid, describedBy }) => (
              <FormTextarea
                id={id}
                required
                invalid={invalid}
                describedBy={describedBy}
                value={useCase}
                onChange={setUseCase}
                placeholder="Describe the phase, data sync, or automation you need."
              />
            )}
          </FormField>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="w-[9rem] shrink-0">
              <FormField id="integration-priority" label="Priority">
                {({ id, invalid, describedBy }) => (
                  <FormSelect
                    id={id}
                    fullWidth={false}
                    invalid={invalid}
                    describedBy={describedBy}
                    value={priority}
                    onChange={(value) => setPriority(value as IntegrationRequestRow["priority"])}
                    options={[
                      { value: "low", label: "Low" },
                      { value: "normal", label: "Normal" },
                      { value: "high", label: "High" },
                    ]}
                  />
                )}
              </FormField>
            </div>
            <button type="submit" className={BUTTON.primaryRow}>
              Submit request
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatUiLabel("Your requests")}</h2>
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[32%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Submitted")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Software")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Use case")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Priority")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Status")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {requests.length === 0 ? (
                <DataTableEmptyRow colSpan={5}>No integration requests yet.</DataTableEmptyRow>
              ) : (
                requests.map((row) => (
                  <DataTableRow key={row.id} multiline>
                    <td className={`${DT.tdClipInset} font-mono text-xs`}>
                      <span className={DT.tdTextSpan}>{row.submittedAt.replace("T", " ").slice(0, 16)}</span>
                    </td>
                    <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                      <span className={DT.tdTextSpan}>{row.softwareName}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdWrapSpan}>{row.useCase}</span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={`${DT.tdTextSpan} capitalize`}>{row.priority}</span>
                    </td>
                    <td className={DT.tdControl}>
                      <div className={`${DT.controlInner} text-sm font-medium capitalize ${requestStatusClass(row.status)}`}>
                        {row.status.replace(/_/g, " ")}
                      </div>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </div>
  );
}
