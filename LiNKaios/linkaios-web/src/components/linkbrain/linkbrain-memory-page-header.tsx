"use client";

import { AddKnowledgeHeaderAction } from "@/components/role-gated-ui";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { useAppRole } from "@/components/role-preview-provider";
import { useAppSurface } from "@/components/app-surface-provider";
import type { LinkbrainTab } from "@/lib/linkbrain-data";
import { linkbrainPageTitle, linkbrainTabSubtitle } from "@/lib/linkbrain-page-copy";

export function LinkbrainMemoryPageHeader(props: { tab: LinkbrainTab }) {
  const { kind } = useAppRole();
  const { isAdmin } = useAppSurface();
  const title = props.tab === "inbox" ? "LiNKbrain" : linkbrainPageTitle(props.tab, kind);
  const isVendorBrain = kind === "licensor" && isAdmin;

  return (
    <ShellPageHeaderClient
      title={title}
      subtitle={linkbrainTabSubtitle(props.tab, kind)}
      actions={isVendorBrain || kind === "licensee" ? <AddKnowledgeHeaderAction collective={isVendorBrain} /> : undefined}
    />
  );
}
