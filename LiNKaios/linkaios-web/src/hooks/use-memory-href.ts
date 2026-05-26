"use client";

import { useCallback } from "react";

import { useAppSurface } from "@/components/app-surface-provider";
import { memoryHref } from "@/lib/memory-href";
import type { LinkbrainTab } from "@/lib/linkbrain-data";

type MemoryHrefOptions = Parameters<typeof memoryHref>[1];

/** LiNKbrain tab URLs scoped to the active app surface (licensee vs `/admin`). */
export function useMemoryHref() {
  const { href: appHref } = useAppSurface();
  return useCallback(
    (tab: LinkbrainTab, options: MemoryHrefOptions = {}) => appHref(memoryHref(tab, options)),
    [appHref],
  );
}

/** Prefix a licensee-relative `/memory/...` path for the active app surface. */
export function useMemoryPath() {
  const { href: appHref } = useAppSurface();
  return useCallback(
    (path: string) => appHref(path.startsWith("/") ? path : `/${path}`),
    [appHref],
  );
}
