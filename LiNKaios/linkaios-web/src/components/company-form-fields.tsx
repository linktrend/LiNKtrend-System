"use client";

import Link from "next/link";

import { InsetSelect } from "@/components/forms";
import { COMPANY_FORM_ROW, COMPANY_FORM_ROW_TOP, FIELD } from "@/lib/ui-standards";

export type CompanyFormField = {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
  type?: "text" | "select";
  options?: readonly string[];
};

export function CompanyFieldGrid(props: {
  rows: { label: string; value: string; href?: string }[];
  /** Tighter label/value pairs for nested person cards (avoids viewport `sm:` two-column gap). */
  dense?: boolean;
}) {
  const rowClass = props.dense
    ? "grid grid-cols-[5.25rem_minmax(0,1fr)] items-baseline gap-x-2"
    : COMPANY_FORM_ROW_TOP;

  return (
    <dl className={props.dense ? "grid gap-2" : "grid gap-4"}>
      {props.rows.map((row) => (
        <div key={row.label} className={rowClass}>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{row.label}</dt>
          <dd className="min-w-0 text-sm text-zinc-900 dark:text-zinc-100">
            {row.href && row.value ? (
              <Link
                href={row.href}
                className="font-medium text-sky-700 underline dark:text-sky-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                {row.value}
              </Link>
            ) : (
              row.value || "—"
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CompanyFormFields(props: {
  fields: CompanyFormField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="grid gap-4">
      {props.fields.map((field) => {
        const value = props.values[field.key] ?? field.value;
        const rowClass = field.multiline ? COMPANY_FORM_ROW_TOP : COMPANY_FORM_ROW;
        const controlClass = FIELD.controlFull;

        return (
          <div key={field.key} className={rowClass}>
            <label htmlFor={field.key} className={`text-sm font-medium text-zinc-500 dark:text-zinc-400 ${field.multiline ? "sm:pt-2" : ""}`}>
              {field.label}
            </label>
            <div className="min-w-0">
              {field.multiline ? (
                <textarea
                  id={field.key}
                  rows={3}
                  value={value}
                  onChange={(event) => props.onChange(field.key, event.target.value)}
                  className={controlClass}
                />
              ) : field.type === "select" && field.options ? (
                <InsetSelect
                  id={field.key}
                  value={value}
                  onChange={(event) => props.onChange(field.key, event.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </InsetSelect>
              ) : (
                <input
                  id={field.key}
                  value={value}
                  onChange={(event) => props.onChange(field.key, event.target.value)}
                  className={controlClass}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CompanyFormGridHeader(props: { labels: string[]; columnsClassName?: string }) {
  return (
    <div className={`hidden gap-3 sm:grid ${props.columnsClassName ?? ""}`}>
      {props.labels.map((label) => (
        <span key={label} className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      ))}
    </div>
  );
}

export function CompanyFormGridRow(props: { columnsClassName: string; children: React.ReactNode }) {
  return <div className={`grid gap-3 ${props.columnsClassName}`}>{props.children}</div>;
}
