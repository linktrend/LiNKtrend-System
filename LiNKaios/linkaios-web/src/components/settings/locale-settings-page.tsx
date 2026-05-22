"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import {
  LOCALE_CURRENCY_OPTIONS,
  LOCALE_DATE_FORMAT_OPTIONS,
  LOCALE_LANGUAGE_OPTIONS,
  LOCALE_NUMBER_FORMAT_OPTIONS,
  LOCALE_REGION_OPTIONS,
  readLocalePreferences,
  writeLocalePreferences,
  type LocalePreferences,
} from "@/lib/locale-preferences";
import { InsetSelect } from "@/components/forms";
import { formatUiLabel } from "@/lib/ui-standards";

type LocaleField = {
  key: keyof LocalePreferences;
  label: string;
  description: string;
  options: readonly string[];
};

const LOCALE_FIELDS: LocaleField[] = [
  { key: "language", label: "Language", description: "Primary UI language for menus, labels, and operator copy.", options: LOCALE_LANGUAGE_OPTIONS },
  { key: "region", label: "Region", description: "Continent or geographic, cultural, or economic region for locale defaults.", options: LOCALE_REGION_OPTIONS },
  { key: "currency", label: "Currency", description: "Default currency for billing summaries and invoice previews.", options: LOCALE_CURRENCY_OPTIONS },
  {
    key: "measurementSystem",
    label: "Measurement system",
    description: "Use metric or imperial units in dashboards and reports.",
    options: ["metric", "imperial"],
  },
  {
    key: "firstDayOfWeek",
    label: "First day of week",
    description: "Calendar and scheduling widgets start on this weekday.",
    options: ["monday", "sunday"],
  },
  { key: "dateFormat", label: "Date format", description: "How dates appear in tables, cards, and exports.", options: LOCALE_DATE_FORMAT_OPTIONS },
  { key: "timeFormat", label: "Time format", description: "12-hour or 24-hour clock in timestamps.", options: ["12h", "24h"] },
  { key: "numberFormat", label: "Number format", description: "Thousands and decimal separators for metrics.", options: LOCALE_NUMBER_FORMAT_OPTIONS },
];

function formatLocaleOptionLabel(fieldKey: keyof LocalePreferences, value: string): string {
  if (fieldKey === "currency" || fieldKey === "dateFormat" || fieldKey === "numberFormat") {
    return value;
  }
  if (value === "12h") return "12-hour";
  if (value === "24h") return "24-hour";
  return formatUiLabel(value.replace(/_/g, " "));
}

export function LocaleSettingsPage() {
  const [prefs, setPrefs] = useState<LocalePreferences>(() => readLocalePreferences());
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    setPrefs(readLocalePreferences());
  }, []);

  const preview = useMemo(() => {
    const sampleDate = prefs.dateFormat.replace("YYYY", "2026").replace("MM", "05").replace("DD", "20");
    const sampleTime = prefs.timeFormat === "24h" ? "14:30" : "2:30 PM";
    return `${sampleDate} · ${sampleTime} · ${prefs.currency} 1,234.56`;
  }, [prefs]);

  function updateField<K extends keyof LocalePreferences>(key: K, value: LocalePreferences[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    writeLocalePreferences(next);
    setFlash("Locale settings saved.");
    window.setTimeout(() => setFlash(null), 3000);
  }

  return (
    <div className="space-y-6">
      {flash ? (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
          {flash}
        </p>
      ) : null}

      <section className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Preview: {preview}</p>

        <DataTableShell>
          <DataTable>
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[38%]" />
              <col className="w-[40%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Setting")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Description")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Value")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {LOCALE_FIELDS.map((field) => (
                <DataTableRow key={field.key} multiline>
                  <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                    <span className={DT.tdTextSpan}>{formatUiLabel(field.label)}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdWrapSpan}>{field.description}</span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      <InsetSelect
                        compact
                        value={prefs[field.key]}
                        onChange={(event) => updateField(field.key, event.target.value as LocalePreferences[typeof field.key])}
                        aria-label={field.label}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {formatLocaleOptionLabel(field.key, option)}
                          </option>
                        ))}
                      </InsetSelect>
                    </div>
                  </td>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </div>
  );
}
