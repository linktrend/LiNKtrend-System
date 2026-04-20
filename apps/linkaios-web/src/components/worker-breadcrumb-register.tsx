"use client";

import { useRegisterBreadcrumbLabel } from "@/components/breadcrumb-label-registry";

/** Maps the UUID segment in `/workers/:id/...` breadcrumbs to the LiNKbot display name. */
export function WorkerBreadcrumbRegister(props: { agentId: string; displayName: string }) {
  useRegisterBreadcrumbLabel(props.agentId, props.displayName);
  return null;
}
