"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Ctx = {
  labels: Record<string, string>;
  register: (id: string, label: string) => void;
  unregister: (id: string) => void;
};

const BreadcrumbLabelContext = createContext<Ctx | null>(null);

export function BreadcrumbLabelProvider(props: { children: ReactNode }) {
  const [labels, setLabels] = useState<Record<string, string>>({});
  const register = useCallback((id: string, label: string) => {
    setLabels((m) => ({ ...m, [id]: label }));
  }, []);
  const unregister = useCallback((id: string) => {
    setLabels((m) => {
      const { [id]: _removed, ...rest } = m;
      return rest;
    });
  }, []);
  const value = useMemo(() => ({ labels, register, unregister }), [labels, register, unregister]);
  return <BreadcrumbLabelContext.Provider value={value}>{props.children}</BreadcrumbLabelContext.Provider>;
}

export function useBreadcrumbLabels(): Record<string, string> {
  return useContext(BreadcrumbLabelContext)?.labels ?? {};
}

/** Registers a UUID segment label (e.g. skill or tool name) for breadcrumbs; clears on unmount. */
export function useRegisterBreadcrumbLabel(id: string | undefined, label: string | undefined) {
  const ctx = useContext(BreadcrumbLabelContext);
  useEffect(() => {
    if (!ctx || !id || !label?.trim()) return;
    ctx.register(id, label.trim());
    return () => ctx.unregister(id);
  }, [ctx, id, label]);
}
