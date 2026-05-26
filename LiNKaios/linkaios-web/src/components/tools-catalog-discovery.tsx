"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

import { CatalogSearchField } from "@/components/catalog-search-field";
import { ToolsCatalogTable, type ToolCatalogRow } from "@/components/tools-catalog-table";

function matchesToolQuery(row: ToolCatalogRow, query: string): boolean {
  const haystack = [row.name, row.category, row.description, row.tool_type].join(" ").toLowerCase();
  return haystack.includes(query);
}

export function ToolsCatalogDiscovery(props: { rows: ToolCatalogRow[] }) {
  const [q, setQ] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredRows = useMemo(() => {
    if (!activeQuery) return props.rows;
    return props.rows.filter((row) => matchesToolQuery(row, activeQuery));
  }, [activeQuery, props.rows]);

  const runSearch = useCallback(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return;
    startTransition(() => {
      setActiveQuery(t);
    });
  }, [q]);

  return (
    <section className="space-y-3">
      <CatalogSearchField
        label="Search tools"
        value={q}
        onChange={setQ}
        onSearch={runSearch}
        placeholder="Describe what you need, e.g. memory lookup or CRM sync"
        pending={pending}
      />
      {activeQuery && filteredRows.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No matches found.</p>
      ) : null}
      {activeQuery && filteredRows.length > 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {filteredRows.length} match{filteredRows.length === 1 ? "" : "es"} for &ldquo;{activeQuery}&rdquo; —{" "}
          <button
            type="button"
            className="font-medium text-sky-800 underline-offset-2 hover:underline dark:text-sky-400"
            onClick={() => {
              setActiveQuery(null);
              setQ("");
            }}
          >
            show all tools
          </button>
        </p>
      ) : null}
      <ToolsCatalogTable rows={filteredRows} />
    </section>
  );
}
