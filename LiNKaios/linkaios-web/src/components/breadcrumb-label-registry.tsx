"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type BreadcrumbLabelActions = {
  register: (id: string, label: string) => void;
  unregister: (id: string) => void;
};

const BreadcrumbLabelActionsContext = createContext<BreadcrumbLabelActions | null>(null);
const BreadcrumbLabelsContext = createContext<Record<string, string>>({});

export function BreadcrumbLabelProvider(props: { children: ReactNode }) {
  const [labels, setLabels] = useState<Record<string, string>>({});

  const register = useCallback((id: string, label: string) => {
    setLabels((m) => (m[id] === label ? m : { ...m, [id]: label }));
  }, []);

  const unregister = useCallback((id: string) => {
    setLabels((m) => {
      if (!(id in m)) return m;
      const { [id]: _removed, ...rest } = m;
      return rest;
    });
  }, []);

  const actions = useMemo(() => ({ register, unregister }), [register, unregister]);

  return (
    <BreadcrumbLabelActionsContext.Provider value={actions}>
      <BreadcrumbLabelsContext.Provider value={labels}>{props.children}</BreadcrumbLabelsContext.Provider>
    </BreadcrumbLabelActionsContext.Provider>
  );
}

export function useBreadcrumbLabels(): Record<string, string> {
  return useContext(BreadcrumbLabelsContext) ?? {};
}

/** Registers a UUID segment label (e.g. skill or tool name) for breadcrumbs; clears on unmount. */
export function useRegisterBreadcrumbLabel(id: string | undefined, label: string | undefined) {
  const register = useContext(BreadcrumbLabelActionsContext)?.register;
  const unregister = useContext(BreadcrumbLabelActionsContext)?.unregister;

  useEffect(() => {
    if (!register || !unregister || !id || !label?.trim()) return;
    const trimmed = label.trim();
    register(id, trimmed);
    return () => unregister(id);
  }, [register, unregister, id, label]);
}
