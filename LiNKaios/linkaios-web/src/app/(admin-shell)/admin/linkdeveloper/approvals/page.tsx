import { ApprovalsInboxTable } from "@/components/linkdeveloper/approvals-inbox-table";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { loadLinkdeveloperApprovalInbox } from "@/lib/admin/linkdeveloper/server-data";

export const dynamic = "force-dynamic";

const APPROVAL_CATEGORIES = [
  "Product blueprint",
  "Architecture",
  "Work packets",
  "Migrations",
  "External integrations",
  "Merge",
  "Staging",
  "Launch",
  "Exceptions",
] as const;

export default async function LinkdeveloperApprovalsPage() {
  const rows = await loadLinkdeveloperApprovalInbox();

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title="Approval center"
        subtitle="Decision packets that need Principal or approver review before work continues."
      />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Categories: {APPROVAL_CATEGORIES.join(" · ")}
      </p>
      <ApprovalsInboxTable rows={rows} />
    </main>
  );
}
