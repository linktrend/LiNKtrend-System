"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  ALL_LICENSEES_SCOPE,
  parseAppRoleTier,
  type AppActorKind,
  type AppRoleTier,
  type LicensorScope,
} from "@/lib/app-roles";
import type { AppSurface } from "@/lib/app-surface";

const STORAGE_KEY = "linkaios.previewRole";

type StoredRoles = Partial<Record<AppActorKind, AppRoleTier>>;

function readStoredRoles(): StoredRoles {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredRoles;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeStoredRoles(roles: StoredRoles) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
}

type RolePreviewContextValue = {
  kind: AppActorKind;
  role: AppRoleTier;
  setRole: (role: AppRoleTier) => void;
};

const RolePreviewContext = createContext<RolePreviewContextValue | null>(null);

export function RolePreviewProvider(props: {
  surface: AppSurface;
  initialRole?: AppRoleTier;
  children: React.ReactNode;
}) {
  const kind: AppActorKind = props.surface === "admin" ? "licensor" : "licensee";
  const [role, setRoleState] = useState<AppRoleTier>(props.initialRole ?? "super_admin");

  useEffect(() => {
    const stored = readStoredRoles()[kind];
    setRoleState(
      stored
        ? parseAppRoleTier(stored)
        : (props.initialRole ?? (kind === "licensor" ? "super_admin" : "admin")),
    );
  }, [kind, props.initialRole]);

  const setRole = useCallback(
    (next: AppRoleTier) => {
      setRoleState(next);
      const stored = readStoredRoles();
      writeStoredRoles({ ...stored, [kind]: next });
    },
    [kind],
  );

  const value = useMemo(() => ({ kind, role, setRole }), [kind, role, setRole]);

  return <RolePreviewContext.Provider value={value}>{props.children}</RolePreviewContext.Provider>;
}

export function useAppRole(): RolePreviewContextValue {
  const ctx = useContext(RolePreviewContext);
  if (!ctx) {
    return {
      kind: "licensee",
      role: "admin",
      setRole: () => {},
    };
  }
  return ctx;
}

const LICENSOR_SCOPE_KEY = "linkaios.licensorScope";

export const EVENT_LICENSOR_SCOPE_CHANGED = "linkaios-licensor-scope-changed";

function readLicensorScopeFromStorage(): LicensorScope {
  if (typeof window === "undefined") return ALL_LICENSEES_SCOPE;
  const stored = window.localStorage.getItem(LICENSOR_SCOPE_KEY);
  return stored ?? ALL_LICENSEES_SCOPE;
}

export function useLicensorScope(): {
  scope: LicensorScope;
  setScope: (scope: LicensorScope) => void;
  isAllLicensees: boolean;
} {
  const [scope, setScopeState] = useState<LicensorScope>(ALL_LICENSEES_SCOPE);

  useEffect(() => {
    setScopeState(readLicensorScopeFromStorage());

    const sync = () => setScopeState(readLicensorScopeFromStorage());
    window.addEventListener(EVENT_LICENSOR_SCOPE_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_LICENSOR_SCOPE_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setScope = useCallback((next: LicensorScope) => {
    setScopeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LICENSOR_SCOPE_KEY, next);
      window.dispatchEvent(new CustomEvent(EVENT_LICENSOR_SCOPE_CHANGED, { detail: next }));
    }
  }, []);

  return {
    scope,
    setScope,
    isAllLicensees: scope === ALL_LICENSEES_SCOPE,
  };
}

export function licensorScopeLabel(scope: LicensorScope, licenseeName?: string): string {
  if (scope === ALL_LICENSEES_SCOPE) return "All licensees";
  return licenseeName ?? scope;
}
