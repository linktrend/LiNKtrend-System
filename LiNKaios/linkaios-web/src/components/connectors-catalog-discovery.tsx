"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { CapabilityConnectorsTable } from "@/components/capability-connectors-table";
import { CatalogSearchField } from "@/components/catalog-search-field";
import {
  readRegisteredCapabilities,
  type RegisteredCapabilityRow,
} from "@/lib/linkskills-requests";
import type { ConnectorCatalogRow } from "@/lib/ui-mocks/capability-connectors-demo";

function registeredToCatalogRow(r: RegisteredCapabilityRow): ConnectorCatalogRow {
  return {
    id: `repo-${r.id}`,
    name: r.name,
    capabilityScope: r.capabilityScope,
    status: r.status,
    targetSoftware: r.targetSoftware,
    usedBy: r.usedBy,
  };
}

function matchesConnectorQuery(row: ConnectorCatalogRow, query: string): boolean {
  const haystack = [row.name, row.targetSoftware, row.usedBy, row.capabilityScope].join(" ").toLowerCase();
  return haystack.includes(query);
}

export function ConnectorsCatalogDiscovery(props: { seedRows: ConnectorCatalogRow[] }) {
  const [q, setQ] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [registeredRows, setRegisteredRows] = useState<ConnectorCatalogRow[]>([]);

  useEffect(() => {
    const sync = () => setRegisteredRows(readRegisteredCapabilities().map(registeredToCatalogRow));
    sync();
    window.addEventListener("linkaios-capability-catalog-changed", sync);
    return () => window.removeEventListener("linkaios-capability-catalog-changed", sync);
  }, []);

  const allRows = useMemo(() => {
    const byId = new Map<string, ConnectorCatalogRow>();
    for (const row of props.seedRows) byId.set(row.id, row);
    for (const row of registeredRows) {
      if (!byId.has(row.id.replace(/^repo-/, ""))) byId.set(row.id, row);
    }
    return [...byId.values()];
  }, [props.seedRows, registeredRows]);

  const filteredRows = useMemo(() => {
    if (!activeQuery) return allRows;
    return allRows.filter((row) => matchesConnectorQuery(row, activeQuery));
  }, [activeQuery, allRows]);

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
        label="Search capabilities"
        value={q}
        onChange={setQ}
        onSearch={runSearch}
        placeholder="Describe what you need, e.g. CRM sync or project tasks"
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
            show all capabilities
          </button>
        </p>
      ) : null}
      <CapabilityConnectorsTable
        rows={filteredRows}
        onArchiveRegistered={() => {
          setRegisteredRows(readRegisteredCapabilities().map(registeredToCatalogRow));
        }}
      />
    </section>
  );
}
