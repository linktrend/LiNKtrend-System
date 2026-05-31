"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SquareArrowOutUpRight } from "lucide-react";

import { FormSelect } from "@/components/forms";
import type { ModuleSampleOutput } from "@/lib/ui-mocks/modules-catalog-demo";
import { formatUiLabel } from "@/lib/ui-standards";

/** Fixed shell height for ~8 three-line rows; inner list scrolls when there are more. */
const OUTPUTS_LIST_SHELL_CLASS =
  "flex h-[calc(8*4.25rem+0.4375rem)] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const ROW_CLASS =
  "group flex w-full min-w-0 items-center gap-3 border-l-4 border-l-sky-500 px-3 py-2 transition " +
  "hover:bg-sky-50/70 dark:border-l-sky-500 dark:hover:bg-sky-950/25";

function ModuleSampleOutputRow(props: { row: ModuleSampleOutput }) {
  const { row } = props;
  const label = `Open ${row.title}`;

  const content = (
    <>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="truncate text-sm font-medium leading-4 text-zinc-900 dark:text-zinc-100">{row.title}</span>
        <span className="truncate text-xs leading-4 text-zinc-500 dark:text-zinc-400">{formatUiLabel(row.artifactType)}</span>
        <span className="truncate text-xs leading-4 text-zinc-500 dark:text-zinc-400">{formatWhen(row.updatedAt)}</span>
      </div>
      <SquareArrowOutUpRight
        className="h-3.5 w-3.5 shrink-0 self-center text-zinc-500 transition group-hover:text-sky-700 dark:text-zinc-400 dark:group-hover:text-sky-400"
        aria-hidden
      />
    </>
  );

  if (row.artifactHref.startsWith("http://") || row.artifactHref.startsWith("https://")) {
    return (
      <li>
        <a
          href={row.artifactHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={ROW_CLASS}
        >
          {content}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link href={row.artifactHref} aria-label={label} title={label} className={ROW_CLASS}>
        {content}
      </Link>
    </li>
  );
}

export function ModuleSampleOutputsList(props: { rows: ModuleSampleOutput[]; owned: boolean }) {
  const artifactTypes = useMemo(
    () => [...new Set(props.rows.map((row) => row.artifactType))].sort((a, b) => a.localeCompare(b)),
    [props.rows],
  );
  const filterOptions = useMemo(
    () => [
      { value: "all", label: formatUiLabel("All artefact types") },
      ...artifactTypes.map((type) => ({ value: type, label: formatUiLabel(type) })),
    ],
    [artifactTypes],
  );
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const visible = useMemo(() => {
    if (typeFilter === "all") return props.rows;
    return props.rows.filter((row) => row.artifactType === typeFilter);
  }, [props.rows, typeFilter]);

  if (props.rows.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {props.owned ? "No outputs published for this module yet." : "No sample outputs published for this module yet."}
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <label htmlFor="module-outputs-type-filter" className="shrink-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {formatUiLabel("Artefact type")}
        </label>
        <FormSelect
          id="module-outputs-type-filter"
          value={typeFilter}
          onChange={setTypeFilter}
          options={filterOptions}
          compact
        />
      </div>

      <div className={OUTPUTS_LIST_SHELL_CLASS}>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {visible.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
              {props.owned
                ? "No outputs match this artefact type."
                : "No sample outputs match this artefact type."}
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {visible.map((row) => (
                <ModuleSampleOutputRow key={row.id} row={row} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
