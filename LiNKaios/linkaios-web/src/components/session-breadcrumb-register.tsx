"use client";

import { useRegisterBreadcrumbLabel } from "@/components/breadcrumb-label-registry";

/** Maps session UUID segments in `/workers/:id/sessions/:sessionId` breadcrumbs to a readable title. */
export function SessionBreadcrumbRegister(props: { sessionId: string; title: string }) {
  useRegisterBreadcrumbLabel(props.sessionId, props.title);
  return null;
}
