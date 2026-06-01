"use client";

import { useCallback, useEffect, useState } from "react";

import {
  canMarkSuiteReady,
  canPublishSuite,
  LICENSOR_SUITE_PRODUCTS,
  type LicensorSuiteProduct,
  type LicensorSuitePublishState,
} from "@/lib/ui-mocks/licensor-suite-catalog";
import { nextSuitePublishState, type SuitePublishAction } from "@/lib/admin-vendor-ops";

const STORAGE_KEY = "linkaios-licensor-suite-publish-v1";

function readOverrides(): Record<string, LicensorSuitePublishState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LicensorSuitePublishState>;
  } catch {
    return {};
  }
}

function writeOverrides(next: Record<string, LicensorSuitePublishState>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("linkaios-licensor-suite-publish"));
}

function applyOverrides(product: LicensorSuiteProduct, overrides: Record<string, LicensorSuitePublishState>): LicensorSuiteProduct {
  const publishState = overrides[product.id] ?? product.publishState;
  return publishState === product.publishState ? product : { ...product, publishState };
}

export function useLicensorSuiteProducts(): {
  products: LicensorSuiteProduct[];
  transitionPublish: (suiteId: string, action: SuitePublishAction) => boolean;
} {
  const [overrides, setOverrides] = useState<Record<string, LicensorSuitePublishState>>({});

  useEffect(() => {
    setOverrides(readOverrides());
    const sync = () => setOverrides(readOverrides());
    window.addEventListener("linkaios-licensor-suite-publish", sync);
    return () => window.removeEventListener("linkaios-licensor-suite-publish", sync);
  }, []);

  const products = LICENSOR_SUITE_PRODUCTS.map((p) => applyOverrides(p, overrides));

  const transitionPublish = useCallback(
    (suiteId: string, action: SuitePublishAction): boolean => {
      const base = products.find((p) => p.id === suiteId);
      if (!base) return false;
      if (action === "mark_ready" && !canMarkSuiteReady(base)) return false;
      if (action === "publish" && !canPublishSuite(base)) return false;
      const next = nextSuitePublishState(base.publishState, action);
      if (!next) return false;
      const merged = { ...readOverrides(), [suiteId]: next };
      writeOverrides(merged);
      setOverrides(merged);
      return true;
    },
    [products],
  );

  return { products, transitionPublish };
}

/** Test-only reset. */
export function clearLicensorSuitePublishOverridesForTests(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
