import { ApprovalsInboxTable } from "@/components/linkdeveloper/approvals-inbox-table";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { loadLinkdeveloperApprovalInbox } from "@/lib/admin/linkdeveloper/server-data";

export const dynamic = "force-dynamic";

/** Client tenant approval inbox — council summary on gate rows (Wave 3.4). */
export default async function ClientLinkdeveloperApprovalsPage() {
  const rows = await loadLinkdeveloperApprovalInbox();

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title="Approval inbox"
        subtitle="Governed decision packets with LLM Council gate summaries. Approve from here or Zulip."
      />
      <ApprovalsInboxTable rows={rows} />
    </main>
  );
}
