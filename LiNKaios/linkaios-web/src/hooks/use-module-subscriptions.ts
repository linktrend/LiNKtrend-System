"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { fixtureMyModulesSubscriptionDemo } from "@/lib/ui-mocks/modules-subscription-demo";

export type ModuleSubscriptionStoreMode = "preview" | "subscribed" | "cancelled";

export type ModuleSubscriptionMode = "none" | "preview" | "subscribed" | "expired" | "cancelled";

export type ModuleSubscriptionRecord = {
  mode: ModuleSubscriptionStoreMode;
  previewEndsAt: string | null;
  subscribedAt: string | null;
};

const STORAGE_KEY = "linkaios-module-subscriptions-v1";

function readStore(): Record<string, ModuleSubscriptionRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ModuleSubscriptionRecord>;
  } catch {
    return {};
  }
}

function writeStore(next: Record<string, ModuleSubscriptionRecord>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("linkaios-module-subscriptions"));
}

export function resolveModuleAccess(
  moduleId: string,
  fixtureLicensed: boolean,
  store: Record<string, ModuleSubscriptionRecord>,
): ModuleSubscriptionMode {
  const row = store[moduleId];
  if (row?.mode === "cancelled") return "cancelled";
  if (row?.mode === "subscribed") return "subscribed";
  if (row?.mode === "preview") {
    if (row.previewEndsAt && new Date(row.previewEndsAt).getTime() > Date.now()) return "preview";
    return "expired";
  }
  if (fixtureLicensed) return "subscribed";
  return "none";
}

export function useModuleSubscriptions(fixtureLicensedByModule: Record<string, boolean>) {
  const [store, setStore] = useState<Record<string, ModuleSubscriptionRecord>>({});
  const demoStore = useMemo(() => fixtureMyModulesSubscriptionDemo(), []);
  const mergedStore = useMemo(() => ({ ...demoStore, ...store }), [demoStore, store]);

  useEffect(() => {
    setStore(readStore());
    const sync = () => setStore(readStore());
    window.addEventListener("linkaios-module-subscriptions", sync);
    return () => window.removeEventListener("linkaios-module-subscriptions", sync);
  }, []);

  const accessFor = useCallback(
    (moduleId: string): ModuleSubscriptionMode =>
      resolveModuleAccess(moduleId, Boolean(fixtureLicensedByModule[moduleId]), mergedStore),
    [fixtureLicensedByModule, mergedStore],
  );

  const startPreview = useCallback((moduleId: string) => {
    const ends = new Date();
    ends.setDate(ends.getDate() + 30);
    setStore((prev) => {
      const next = {
        ...prev,
        [moduleId]: {
          mode: "preview" as const,
          previewEndsAt: ends.toISOString(),
          subscribedAt: null,
        },
      };
      writeStore(next);
      return next;
    });
  }, []);

  const subscribe = useCallback((moduleId: string) => {
    setStore((prev) => {
      const next = {
        ...prev,
        [moduleId]: {
          mode: "subscribed" as const,
          previewEndsAt: null,
          subscribedAt: new Date().toISOString(),
        },
      };
      writeStore(next);
      return next;
    });
  }, []);

  return { store, accessFor, startPreview, subscribe };
}
