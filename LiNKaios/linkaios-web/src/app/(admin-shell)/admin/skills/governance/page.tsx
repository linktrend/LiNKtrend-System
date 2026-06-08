import { AdminLinkskillsGovernancePanel } from "@/components/admin/admin-linkskills-governance-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";

export const dynamic = "force-dynamic";

export default function AdminSkillsGovernancePage() {
  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="LinkSkills governance"
        subtitle="Licensor tenant — capability kill switches and lease ledger for LiNKtrend Admin."
      />
      <AdminLinkskillsGovernancePanel />
    </main>
  );
}
