"use client";

import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";

import { statusPillEqualWidthCh } from "@/lib/status-colors";

type StatusPillWidthContextValue = {
  widthCh: number;
  widthClass: string;
};

const StatusPillWidthContext = createContext<StatusPillWidthContextValue | null>(null);

export function useStatusPillWidthContext(): StatusPillWidthContextValue | null {
  return useContext(StatusPillWidthContext);
}

/** Wrap a visual pill group so every {@link StatusPill} with `equalWidth` shares width from the longest label. */
export function StatusPillWidthProvider(props: { labels: readonly string[]; children: ReactNode; className?: string }) {
  const value = useMemo(() => {
    const widthCh = statusPillEqualWidthCh(props.labels);
    return { widthCh, widthClass: `w-[${widthCh}ch]` };
  }, [props.labels]);

  const style = { ["--status-pill-width-ch" as string]: String(value.widthCh) } as CSSProperties;

  if (props.className) {
    return (
      <StatusPillWidthContext.Provider value={value}>
        <div className={props.className} style={style}>
          {props.children}
        </div>
      </StatusPillWidthContext.Provider>
    );
  }

  return (
    <StatusPillWidthContext.Provider value={value}>
      <div style={style}>{props.children}</div>
    </StatusPillWidthContext.Provider>
  );
}
