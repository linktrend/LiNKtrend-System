"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  canMarkSuiteReady,
  canPublishSuite,
  LICENSOR_SUITE_PRODUCTS,
  type LicensorSuiteProduct,
  type LicensorSuitePublishState,
  withCompositionCounts,
  applySuiteCompositionAction,
  type SuiteCompositionAction,
} from "@/lib/licensor-suite-catalog";
import type { ModuleProcess } from "@/lib/ui-mocks/modules-catalog-demo";
import { nextSuitePublishState, type SuitePublishAction } from "@/lib/admin-vendor-ops";

const PUBLISH_KEY = "linkaios-licensor-suite-publish-v1";
const STORE_KEY = "linkaios-licensor-suite-store-v1";
const EVENT_NAME = "linkaios-licensor-suite-store";

type SuiteStoreSnapshot = {
  publish: Record<string, LicensorSuitePublishState>;
  customSuites: Record<
    string,
    { name: string; summary: string; publishState: LicensorSuitePublishState; stripeProductId: string | null }
  >;
  modules: Record<string, ModuleProcessOverride>;
  stripe: Record<string, string | null>;
  meta: Record<string, { name?: string; summary?: string }>;
};

type ModuleProcessOverride = LicensorSuiteProduct["modules"];

function emptySnapshot(): SuiteStoreSnapshot {
  return { publish: {}, customSuites: {}, modules: {}, stripe: {}, meta: {} };
}

function readSnapshot(): SuiteStoreSnapshot {
  if (typeof window === "undefined") return emptySnapshot();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      return { ...emptySnapshot(), ...(JSON.parse(raw) as SuiteStoreSnapshot) };
    }
    const legacyPublish = window.localStorage.getItem(PUBLISH_KEY);
    if (legacyPublish) {
      return { ...emptySnapshot(), publish: JSON.parse(legacyPublish) as Record<string, LicensorSuitePublishState> };
    }
  } catch {
    return emptySnapshot();
  }
  return emptySnapshot();
}

function writeSnapshot(next: SuiteStoreSnapshot) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
}

function mergeProduct(base: LicensorSuiteProduct, snapshot: SuiteStoreSnapshot): LicensorSuiteProduct {
  const custom = snapshot.customSuites[base.id];
  const meta = snapshot.meta[base.id];
  const modules = snapshot.modules[base.id] ?? base.modules;
  const stripeProductId =
    snapshot.stripe[base.id] !== undefined ? snapshot.stripe[base.id] : (custom?.stripeProductId ?? base.stripeProductId);
  const publishState = snapshot.publish[base.id] ?? custom?.publishState ?? base.publishState;

  return withCompositionCounts({
    id: base.id,
    name: meta?.name ?? custom?.name ?? base.name,
    summary: meta?.summary ?? custom?.summary ?? base.summary,
    publishState,
    stripeProductId,
    modules,
  });
}

export function useLicensorSuiteStore(): {
  products: LicensorSuiteProduct[];
  getSuite: (suiteId: string) => LicensorSuiteProduct | undefined;
  transitionPublish: (suiteId: string, action: SuitePublishAction) => boolean;
  applyComposition: (suiteId: string, action: SuiteCompositionAction) => { ok: boolean; reason?: string };
  createDraftSuite: (input: { id: string; name: string; summary: string }) => void;
  linkStripeProduct: (suiteId: string, stripeProductId: string | null) => void;
} {
  const [snapshot, setSnapshot] = useState<SuiteStoreSnapshot>(emptySnapshot);

  useEffect(() => {
    setSnapshot(readSnapshot());
    const sync = () => setSnapshot(readSnapshot());
    window.addEventListener(EVENT_NAME, sync);
    return () => window.removeEventListener(EVENT_NAME, sync);
  }, []);

  const seedIds = useMemo(() => new Set(LICENSOR_SUITE_PRODUCTS.map((p) => p.id)), []);

  const products = useMemo(() => {
    const mergedSeeds = LICENSOR_SUITE_PRODUCTS.map((base) => mergeProduct(base, snapshot));
    const customRows = Object.entries(snapshot.customSuites)
      .filter(([id]) => !seedIds.has(id))
      .map(([id, custom]) =>
        mergeProduct(
          withCompositionCounts({
            id,
            name: custom.name,
            summary: custom.summary,
            publishState: custom.publishState,
            stripeProductId: custom.stripeProductId,
            modules: snapshot.modules[id] ?? [],
          }),
          snapshot,
        ),
      );
    return [...mergedSeeds, ...customRows];
  }, [snapshot, seedIds]);

  const getSuite = useCallback(
    (suiteId: string) => products.find((row) => row.id === suiteId),
    [products],
  );

  const transitionPublish = useCallback(
    (suiteId: string, action: SuitePublishAction): boolean => {
      const base = products.find((p) => p.id === suiteId);
      if (!base) return false;
      if (action === "mark_ready" && !canMarkSuiteReady(base)) return false;
      if (action === "publish" && !canPublishSuite(base)) return false;
      const next = nextSuitePublishState(base.publishState, action);
      if (!next) return false;
      const current = readSnapshot();
      writeSnapshot({ ...current, publish: { ...current.publish, [suiteId]: next } });
      setSnapshot(readSnapshot());
      return true;
    },
    [products],
  );

  const applyComposition = useCallback((suiteId: string, action: SuiteCompositionAction) => {
    const base = products.find((p) => p.id === suiteId);
    if (!base) return { ok: false, reason: "Suite not found." };
    const result = applySuiteCompositionAction(base.modules, action);
    if (!result.ok) return result;
    const current = readSnapshot();
    writeSnapshot({ ...current, modules: { ...current.modules, [suiteId]: result.modules } });
    setSnapshot(readSnapshot());
    return { ok: true };
  }, [products]);

  const createDraftSuite = useCallback((input: { id: string; name: string; summary: string }) => {
    const current = readSnapshot();
    writeSnapshot({
      ...current,
      customSuites: {
        ...current.customSuites,
        [input.id]: {
          name: input.name,
          summary: input.summary,
          publishState: "draft",
          stripeProductId: null,
        },
      },
    });
    setSnapshot(readSnapshot());
  }, []);

  const linkStripeProduct = useCallback((suiteId: string, stripeProductId: string | null) => {
    const current = readSnapshot();
    writeSnapshot({ ...current, stripe: { ...current.stripe, [suiteId]: stripeProductId } });
    setSnapshot(readSnapshot());
  }, []);

  return {
    products,
    getSuite,
    transitionPublish,
    applyComposition,
    createDraftSuite,
    linkStripeProduct,
  };
}

/** Back-compat alias for list/publish consumers. */
export function useLicensorSuiteProducts(): {
  products: LicensorSuiteProduct[];
  transitionPublish: (suiteId: string, action: SuitePublishAction) => boolean;
} {
  const { products, transitionPublish } = useLicensorSuiteStore();
  return { products, transitionPublish };
}

export function clearLicensorSuiteStoreForTests(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORE_KEY);
    window.localStorage.removeItem(PUBLISH_KEY);
  }
}

/** @deprecated Use clearLicensorSuiteStoreForTests */
export function clearLicensorSuitePublishOverridesForTests(): void {
  clearLicensorSuiteStoreForTests();
}
