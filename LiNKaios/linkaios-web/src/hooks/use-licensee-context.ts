"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { effectiveBrandId, parseLicenseeContext, type LicenseeContext } from "@/lib/licensee-context";
import { topologyDisplayMode } from "@/lib/tenant-topology";
import { useTenantTopology } from "@/hooks/use-tenant-topology";

export function useLicenseeContext(): LicenseeContext & {
  effectiveBrandId: string | null;
  topologyMode: ReturnType<typeof useTenantTopology>["mode"];
  display: ReturnType<typeof topologyDisplayMode>;
} {
  const searchParams = useSearchParams();
  const { mode: topologyMode } = useTenantTopology();

  return useMemo(() => {
    const ctx = parseLicenseeContext(searchParams, topologyMode);
    return {
      ...ctx,
      effectiveBrandId: effectiveBrandId(ctx),
      topologyMode,
      display: topologyDisplayMode(topologyMode),
    };
  }, [searchParams, topologyMode]);
}
