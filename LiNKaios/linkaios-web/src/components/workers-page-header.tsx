"use client";

import { useAppSurface } from "@/components/app-surface-provider";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";

export function WorkersPageHeader() {
  const { isAdmin } = useAppSurface();
  const title = isAdmin ? "All LiNKbots" : "LiNKbots";
  const subtitle = isAdmin
    ? "Every deployed LiNKbot — runtime id, kind, and status on each card. Use the sidebar View filter to narrow by admin or licensee scope."
    : "Your AI workforce — fleet status, sessions, skills, and configuration.";

  return <ShellPageHeaderClient title={title} subtitle={subtitle} hideLicensorScope actions={undefined} />;
}
