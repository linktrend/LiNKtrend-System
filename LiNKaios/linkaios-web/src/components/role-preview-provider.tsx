"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  isAdminViewScope,
  isAllLicenseesScope,
  isCrossTenantReadOnlyScope,
  isPlatformAllScope,
  isSingleLicenseeScope,
  parseAppRoleTier,
  type AppActorKind,
  type AppRoleTier,
  type LicensorScope,
} from "@/lib/app-roles";
import {
  LICENSOR_SCOPE_PARAM,
  licensorViewLabel,
  normalizeLicensorScope,
} from "@/lib/licensor-view-scope";
import { resolveLicenseeRegistry } from "@/lib/licensee-registry";
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

function readLicensorScopeFromLocation(searchParams: URLSearchParams | null): LicensorScope {
  if (typeof window === "undefined") {
    const fromQuery = searchParams?.get(LICENSOR_SCOPE_PARAM);
    return normalizeLicensorScope(fromQuery);
  }
  const fromUrl = new URL(window.location.href).searchParams.get(LICENSOR_SCOPE_PARAM);
  if (fromUrl) return normalizeLicensorScope(fromUrl);
  const stored = window.localStorage.getItem(LICENSOR_SCOPE_KEY);
  return normalizeLicensorScope(stored);
}

export function useLicensorScope(): {
  scope: LicensorScope;
  setScope: (scope: LicensorScope) => void;
  isPlatformAll: boolean;
  isAdminView: boolean;
  isAllLicensees: boolean;
  isSingleLicensee: boolean;
  isCrossTenantReadOnly: boolean;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scope, setScopeState] = useState<LicensorScope>(() =>
    readLicensorScopeFromLocation(searchParams),
  );

  useEffect(() => {
    setScopeState(readLicensorScopeFromLocation(searchParams));

    const sync = () => setScopeState(readLicensorScopeFromLocation(searchParams));
    window.addEventListener(EVENT_LICENSOR_SCOPE_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_LICENSOR_SCOPE_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, [searchParams]);

  const setScope = useCallback(
    (next: LicensorScope) => {
      const normalized = normalizeLicensorScope(next);
      setScopeState(normalized);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LICENSOR_SCOPE_KEY, normalized);
        window.dispatchEvent(new CustomEvent(EVENT_LICENSOR_SCOPE_CHANGED, { detail: normalized }));
      }

      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (isPlatformAllScope(normalized)) {
        params.delete(LICENSOR_SCOPE_PARAM);
      } else {
        params.set(LICENSOR_SCOPE_PARAM, normalized);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return {
    scope,
    setScope,
    isPlatformAll: isPlatformAllScope(scope),
    isAdminView: isAdminViewScope(scope),
    isAllLicensees: isAllLicenseesScope(scope),
    isSingleLicensee: isSingleLicenseeScope(scope),
    isCrossTenantReadOnly: isCrossTenantReadOnlyScope(scope),
  };
}

export function licensorScopeLabel(scope: LicensorScope, licenseeName?: string): string {
  return licensorViewLabel(scope, licenseeName ?? resolveLicenseeRegistry(scope)?.name);
}
