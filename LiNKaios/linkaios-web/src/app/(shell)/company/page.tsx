import { listBrainLegalEntities, listBrainOrgNodes, listBrainVirtualFilesByScope } from "@linktrend/linklogic-sdk";

import { CompanyPageShell } from "@/components/company-page-shell";
import { isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memoryHref } from "@/lib/memory-href";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const uiMocks = isUiMocksEnabled();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [legalRes, nodesRes, companyFilesRes] = await Promise.all([
    listBrainLegalEntities(supabase),
    listBrainOrgNodes(supabase),
    listBrainVirtualFilesByScope(supabase, "company"),
  ]);
  const orgLoadFailed = Boolean(legalRes.error || nodesRes.error);
  const legalRows = orgLoadFailed ? undefined : legalRes.data;
  const nodes = orgLoadFailed ? null : nodesRes.data;
  const primaryEntity = legalRows?.[0];
  const companyFiles = companyFilesRes.error ? [] : (companyFilesRes.data ?? []);
  const companyKnowledgeCount = companyFilesRes.error ? null : companyFiles.length;
  const companyKnowledgePreview = companyFiles.slice(0, 8).map((f) => ({
    id: String(f.id),
    path: String(f.logical_path ?? "—"),
  }));
  const inboxHref = memoryHref("inbox", {});
  const companyMemoryHref = memoryHref("company", {});
  const isVendorOperator =
    user?.id != null
      ? await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email })
      : false;

  return (
    <CompanyPageShell
      orgLoadFailed={orgLoadFailed}
      primaryEntity={primaryEntity}
      nodes={nodes}
      companyKnowledgeCount={companyKnowledgeCount}
      companyKnowledgePreview={companyKnowledgePreview}
      inboxHref={inboxHref}
      companyMemoryHref={companyMemoryHref}
      uiMocks={uiMocks}
      isVendorOperator={isVendorOperator}
    />
  );
}
