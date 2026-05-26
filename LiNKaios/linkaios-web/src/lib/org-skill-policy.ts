"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const ORG_SKILL_POLICY_STORAGE_KEY = "linkaios.org-skill-policy.v1";

/** Demo defaults — licensor catalogue rows with company policy preset for UI review. */
const ORG_SKILL_POLICY_SEEDS: Record<string, boolean> = {
  "00000000-0000-4000-8000-00000000b103": false,
};

export type OrgSkillPolicyRow = {
  id: string;
  published: boolean;
  status: string;
  isFixture?: boolean;
};

function readOverrides(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ORG_SKILL_POLICY_STORAGE_KEY);
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
  window.localStorage.setItem(ORG_SKILL_POLICY_STORAGE_KEY, JSON.stringify(overrides));
}

export function defaultOrgEnabledForSkill(row: OrgSkillPolicyRow): boolean {
  if (row.id in ORG_SKILL_POLICY_SEEDS) return ORG_SKILL_POLICY_SEEDS[row.id]!;
  if (row.status === "deprecated" || row.status === "archived") return false;
  if (row.isFixture) return row.status === "approved" && row.published;
  return row.published;
}

export function useOrgSkillPolicy(rows: OrgSkillPolicyRow[]) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOverrides(readOverrides());
    setHydrated(true);
  }, []);

  const orgEnabledById = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const row of rows) {
      map.set(row.id, row.id in overrides ? overrides[row.id]! : defaultOrgEnabledForSkill(row));
    }
    return map;
  }, [rows, overrides]);

  const setOrgEnabled = useCallback((skillId: string, enabled: boolean) => {
    setOverrides((prev) => {
      const next = { ...prev, [skillId]: enabled };
      writeOverrides(next);
      return next;
    });
  }, []);

  return { hydrated, orgEnabledById, setOrgEnabled };
}
