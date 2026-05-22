"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ChevronDown, ChevronUp, ListOrdered, Rocket } from "lucide-react";

import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { TitledCardHeader } from "@/components/titled-card-header";
import type { ModuleSubscriptionMode } from "@/hooks/use-module-subscriptions";
import { useModuleSubscriptions } from "@/hooks/use-module-subscriptions";
import {
  fixtureLicensedByModule,
  MODULES_CATALOG_DEMO,
  processesForModule,
  type ModuleCatalogueItem,
  type ModuleProcess,
} from "@/lib/ui-mocks/modules-catalog-demo";
import { getSuiteById } from "@/lib/suites-page-copy";
import { BUTTON, TABLE_COLUMN } from "@/lib/ui-standards";

type Cadence = "once" | "continuous";

const STEPS = ["Suite", "Modules", "Cadence", "Launch"] as const;

const WIZARD_TABLE_CELL = "block min-w-0 line-clamp-3 leading-snug";

const suiteSearchInputClass =
  "w-full max-w-md rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100";

function ownedSuites(accessFor: (id: string) => string) {
  return MODULES_CATALOG_DEMO.modules.filter((m) => {
    const access = accessFor(m.id);
    return access === "subscribed" || access === "preview";
  });
}

function accessLabel(mode: ModuleSubscriptionMode): string {
  if (mode === "subscribed") return "Subscribed";
  if (mode === "preview") return "Preview";
  return "—";
}

function publishedModuleCount(suiteId: string): number {
  return processesForModule(suiteId).filter((p) => p.published).length;
}

function SuitePickerTable(props: {
  suites: ModuleCatalogueItem[];
  accessFor: (id: string) => ModuleSubscriptionMode;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const sorted = [...props.suites].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q),
    );
  }, [props.suites, q]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="min-w-0 flex-1 sm:max-w-md">
          <span className="mb-1 block text-sm font-medium text-zinc-900 dark:text-zinc-100">Filter suites</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or summary…"
            aria-label="Filter suites"
            className={suiteSearchInputClass}
          />
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {filtered.length} of {props.suites.length} suites
        </p>
      </div>

      <DataTableShell scrollableBody>
        <DataTable>
          <colgroup>
            <col className="w-[8%]" />
            <col className="w-[22%]" />
            <col className="w-[44%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>Select</div>
              </th>
              <th className={DT.thTextInset}>{TABLE_COLUMN.suite}</th>
              <th className={DT.thTextInset}>{TABLE_COLUMN.summary}</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>{TABLE_COLUMN.module}s</div>
              </th>
              <th className={DT.thTextInset}>Access</th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {filtered.length === 0 ? (
              <DataTableEmptyRow colSpan={5}>No suites match your filter.</DataTableEmptyRow>
            ) : (
              filtered.map((suite) => {
                const selected = props.selectedId === suite.id;
                const moduleCount = publishedModuleCount(suite.id);
                return (
                  <DataTableRow
                    key={suite.id}
                    multiline
                    className={selected ? "bg-zinc-50 dark:bg-zinc-900/50" : undefined}
                  >
                    <td className={DT.tdControl}>
                      <div className={DT.controlInner}>
                        <input
                          type="radio"
                          name="wizard-suite"
                          checked={selected}
                          onChange={() => props.onSelect(suite.id)}
                          aria-label={`Select ${suite.name}`}
                          className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                        />
                      </div>
                    </td>
                    <td className={DT.tdClipInset}>
                      <button
                        type="button"
                        onClick={() => props.onSelect(suite.id)}
                        className="w-full text-left"
                      >
                        <span className={WIZARD_TABLE_CELL} title={suite.name}>
                          {suite.name}
                        </span>
                      </button>
                    </td>
                    <td className={DT.tdClipInset}>
                      <button
                        type="button"
                        onClick={() => props.onSelect(suite.id)}
                        className="w-full text-left"
                      >
                        <span className={WIZARD_TABLE_CELL} title={suite.summary}>
                          {suite.summary}
                        </span>
                      </button>
                    </td>
                    <td className={DT.tdControl}>
                      <div className={`${DT.controlInner} tabular-nums`}>{moduleCount}</div>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={WIZARD_TABLE_CELL}>{accessLabel(props.accessFor(suite.id))}</span>
                    </td>
                  </DataTableRow>
                );
              })
            )}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </div>
  );
}

function stepClass(active: boolean, done: boolean) {
  const base = "rounded-xl border px-4 py-3 text-sm ";
  if (active) return base + "border-zinc-900 bg-zinc-50 font-semibold dark:border-zinc-100 dark:bg-zinc-900/60";
  if (done) return base + "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400";
  return base + "border-zinc-100 bg-zinc-50/80 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-500";
}

function ModulePickerRow(props: {
  process: ModuleProcess;
  selected: boolean;
  order: number | null;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <input
        type="checkbox"
        checked={props.selected}
        onChange={props.onToggle}
        className="mt-1 h-4 w-4 rounded border-zinc-300"
        aria-label={`Include ${props.process.name}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{props.process.name}</p>
        <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{props.process.summary}</p>
        {props.process.rerunsAutomatically ? (
          <p className="mt-1 text-[11px] font-medium text-sky-700 dark:text-sky-300">Supports continuous runs</p>
        ) : null}
      </div>
      {props.selected ? (
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">#{props.order}</span>
          <button type="button" onClick={props.onMoveUp} disabled={!props.canMoveUp} className="rounded p-0.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30" aria-label="Move up">
            <ChevronUp className="h-4 w-4" />
          </button>
          <button type="button" onClick={props.onMoveDown} disabled={!props.canMoveDown} className="rounded p-0.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30" aria-label="Move down">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function NewProjectWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetSuiteId = searchParams.get("suite")?.trim() ?? "";
  const presetModules = searchParams.get("modules")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  const fixtureLicensed = useMemo(() => fixtureLicensedByModule(), []);
  const { accessFor } = useModuleSubscriptions(fixtureLicensed);
  const suites = useMemo(() => ownedSuites(accessFor), [accessFor]);

  const [step, setStep] = useState(0);
  const [suiteId, setSuiteId] = useState(presetSuiteId);
  const [moduleOrder, setModuleOrder] = useState<string[]>(presetModules);
  const [cadence, setCadence] = useState<Cadence>("once");
  const [projectName, setProjectName] = useState("");

  const suite = suiteId ? getSuiteById(suiteId) : undefined;
  const catalogue = suiteId ? processesForModule(suiteId).filter((p) => p.published) : [];

  const selectedSet = new Set(moduleOrder);

  function toggleModule(id: string) {
    setModuleOrder((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function moveModule(id: string, dir: -1 | 1) {
    setModuleOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next]!, copy[idx]!];
      return copy;
    });
  }

  function canNext(): boolean {
    if (step === 0) return Boolean(suiteId);
    if (step === 1) return moduleOrder.length > 0;
    if (step === 2) return cadence === "once" || cadence === "continuous";
    return projectName.trim().length > 0;
  }

  function launchProject() {
    const slug = projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-project";
    router.push(`/projects/demo-${slug}?created=1`);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TitledCardHeader icon={ListOrdered} title="Add Project" titleClassName="text-sm font-semibold text-zinc-500 dark:text-zinc-400" />
        <ol className="mt-4 grid gap-3 sm:grid-cols-4">
          {STEPS.map((label, i) => (
            <li key={label} className={stepClass(step === i, step > i)}>
              {i + 1}. {label}
            </li>
          ))}
        </ol>
      </section>

      {step === 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Choose suite</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Pick the subscribed suite this project belongs to. Filter the list when you have many suites — you can add
            one or more modules from its catalogue in the next step.
          </p>
          {suites.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Subscribe to a suite first from{" "}
              <Link href="/suites/marketplace" className="font-medium underline-offset-2 hover:underline">
                Marketplace
              </Link>
              .
            </p>
          ) : (
            <SuitePickerTable
              suites={suites}
              accessFor={accessFor}
              selectedId={suiteId}
              onSelect={(id) => {
                setSuiteId(id);
                setModuleOrder([]);
              }}
            />
          )}
        </section>
      ) : null}

      {step === 1 && suite ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Select modules</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Choose one or more modules from {suite.name}. Order defines how phases appear in the project tree.
          </p>
          <ul className="space-y-2">
            {catalogue.map((process) => (
              <ModulePickerRow
                key={process.id}
                process={process}
                selected={selectedSet.has(process.id)}
                order={selectedSet.has(process.id) ? moduleOrder.indexOf(process.id) + 1 : null}
                onToggle={() => toggleModule(process.id)}
                onMoveUp={() => moveModule(process.id, -1)}
                onMoveDown={() => moveModule(process.id, 1)}
                canMoveUp={moduleOrder.indexOf(process.id) > 0}
                canMoveDown={moduleOrder.indexOf(process.id) >= 0 && moduleOrder.indexOf(process.id) < moduleOrder.length - 1}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Project cadence</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Once projects complete after a single pass. Continuous projects schedule recurring runs (shown as Run progress, not Plane cycles).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["once", "Once", "Single delivery — progress bar tracks phase completion to done."],
                ["continuous", "Continuous", "Recurring runs — each pass is a Run; Plane sync stays internal."],
              ] as const
            ).map(([id, title, desc]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCadence(id)}
                className={
                  "rounded-xl border px-4 py-3 text-left " +
                  (cadence === id
                    ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/60"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950")
                }
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{desc}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 3 && suite ? (
        <section className="space-y-4">
          <TitledCardHeader icon={Rocket} title="Review & launch" titleClassName="text-sm font-semibold text-zinc-900 dark:text-zinc-100" />
          <label className="block text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">Project name</span>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Acme preview site"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Suite</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">{suite.name}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Cadence</dt>
              <dd className="font-medium capitalize text-zinc-900 dark:text-zinc-100">{cadence}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">Modules (in order)</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                {moduleOrder
                  .map((id) => catalogue.find((p) => p.id === id)?.name ?? id)
                  .join(" → ") || "—"}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Launch creates an empty Plane project and provisions LiNKaios orchestration. Studio-hosted Plane — no customer configuration required.
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className={BUTTON.editCompact}>
            Back
          </button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <button type="button" disabled={!canNext()} onClick={() => setStep((s) => s + 1)} className={BUTTON.approveCompact}>
            Continue
          </button>
        ) : (
          <button type="button" disabled={!canNext()} onClick={launchProject} className={BUTTON.approveRow}>
            Launch project
          </button>
        )}
      </div>
    </div>
  );
}
