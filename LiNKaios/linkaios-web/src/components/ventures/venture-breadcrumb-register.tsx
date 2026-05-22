"use client";

import { useRegisterBreadcrumbLabel } from "@/components/breadcrumb-label-registry";

/** Maps the venture id segment in `/suites/linkapps/ventures/:id` breadcrumbs to the display name. */
export function VentureBreadcrumbRegister(props: { ventureId: string; displayName: string }) {
  useRegisterBreadcrumbLabel(props.ventureId, props.displayName);
  return null;
}
