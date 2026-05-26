"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const ORG_TOOL_POLICY_STORAGE_KEY = "linkaios.org-tool-policy.v1";

export type OrgToolPolicyRow = {
  id: string;
  published: boolean;
  status: string;
  isFixture?: boolean;
};

function readOverrides(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ORG_TOOL_POLICY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORG_TOOL_POLICY_STORAGE_KEY, JSON.stringify(overrides));
}

export function defaultOrgEnabledForTool(row: OrgToolPolicyRow): boolean {
  if (row.status === "archived" || row.status === "draft") return false;
  if (row.isFixture) return row.status === "approved" && row.published;
  return row.published;
}

export function useOrgToolPolicy(rows: OrgToolPolicyRow[]) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOverrides(readOverrides());
    setHydrated(true);
  }, []);

  const orgEnabledById = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const row of rows) {
      map.set(row.id, row.id in overrides ? overrides[row.id]! : defaultOrgEnabledForTool(row));
    }
    return map;
  }, [rows, overrides]);

  const setOrgEnabled = useCallback((toolId: string, enabled: boolean) => {
    setOverrides((prev) => {
      const next = { ...prev, [toolId]: enabled };
      writeOverrides(next);
      return next;
    });
  }, []);

  return { hydrated, orgEnabledById, setOrgEnabled };
}
