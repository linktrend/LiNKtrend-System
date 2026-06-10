"use client";

import { useRegisterBreadcrumbLabel } from "@/components/breadcrumb-label-registry";

/** Maps project UUID segments in `/projects/:id` breadcrumbs to the project title. */
export function ProjectBreadcrumbRegister(props: { projectId: string; title: string }) {
  useRegisterBreadcrumbLabel(props.projectId, props.title);
  return null;
}
