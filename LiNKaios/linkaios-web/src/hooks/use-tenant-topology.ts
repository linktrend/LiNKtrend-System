"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_TENANT_TOPOLOGY,
  TENANT_TOPOLOGY_MODES,
  type TenantTopologyMode,
} from "@/lib/tenant-topology";

export const TENANT_TOPOLOGY_STORAGE_KEY = "linkaios-tenant-topology-v1";
export const TENANT_TOPOLOGY_CHANGED_EVENT = "linkaios-tenant-topology-changed";

function readTopology(): TenantTopologyMode {
  if (typeof window === "undefined") return DEFAULT_TENANT_TOPOLOGY;
  try {
    const raw = window.localStorage.getItem(TENANT_TOPOLOGY_STORAGE_KEY);
    if (raw && (TENANT_TOPOLOGY_MODES as readonly string[]).includes(raw)) {
      return raw as TenantTopologyMode;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_TENANT_TOPOLOGY;
}

function writeTopology(mode: TenantTopologyMode) {
  window.localStorage.setItem(TENANT_TOPOLOGY_STORAGE_KEY, mode);
  window.dispatchEvent(new Event(TENANT_TOPOLOGY_CHANGED_EVENT));
}

export function useTenantTopology() {
  const [mode, setModeState] = useState<TenantTopologyMode>(DEFAULT_TENANT_TOPOLOGY);

  useEffect(() => {
    setModeState(readTopology());
    const sync = () => setModeState(readTopology());
    window.addEventListener(TENANT_TOPOLOGY_CHANGED_EVENT, sync);
    return () => window.removeEventListener(TENANT_TOPOLOGY_CHANGED_EVENT, sync);
  }, []);

  const setMode = useCallback((next: TenantTopologyMode) => {
    writeTopology(next);
    setModeState(next);
  }, []);

  return { mode, setMode };
}
