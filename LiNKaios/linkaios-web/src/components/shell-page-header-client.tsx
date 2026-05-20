"use client";

import { useRouter } from "next/navigation";

import { ShellPageHeader } from "@/components/shell-page-header";

/** Client wrapper so server pages get Refresh + Help in the shared page header. */
export function ShellPageHeaderClient(props: {
  title: string;
  subtitle: string;
  showRefresh?: boolean;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <ShellPageHeader
      title={props.title}
      subtitle={props.subtitle}
      actions={props.actions}
      onRefresh={props.showRefresh !== false ? () => router.refresh() : undefined}
    />
  );
}
