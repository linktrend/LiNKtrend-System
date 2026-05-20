import { listBrainLegalEntities, listBrainOrgNodes, listBrainVirtualFilesByScope } from "@linktrend/linklogic-sdk";

import { CompanyPageShell } from "@/components/company-page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memoryHref } from "@/lib/memory-href";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const uiMocks = isUiMocksEnabled();
  const supabase = await createSupabaseServerClient();

  const [legalRes, nodesRes, companyFilesRes] = await Promise.all([
    listBrainLegalEntities(supabase),
    listBrainOrgNodes(supabase),
    listBrainVirtualFilesByScope(supabase, "company"),
  ]);
  const orgLoadFailed = Boolean(legalRes.error || nodesRes.error);
  const legalRows = orgLoadFailed ? undefined : legalRes.data;
  const nodes = orgLoadFailed ? null : nodesRes.data;
  const primaryEntity = legalRows?.[0];
  const companyKnowledgeCount = companyFilesRes.error ? null : (companyFilesRes.data?.length ?? 0);
  const inboxHref = memoryHref("inbox", {});
  const companyMemoryHref = memoryHref("company", {});

  return (
    <CompanyPageShell
      orgLoadFailed={orgLoadFailed}
      primaryEntity={primaryEntity}
      nodes={nodes}
      companyKnowledgeCount={companyKnowledgeCount}
      inboxHref={inboxHref}
      companyMemoryHref={companyMemoryHref}
      uiMocks={uiMocks}
    />
  );
}
