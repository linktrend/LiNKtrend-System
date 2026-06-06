import { LiNKsuitegenDashboard } from "@/components/admin/linksuitegen-dashboard";
import { ShellPageHeader } from "@/components/shell-page-header";

export default function AdminLinksuitegenPage() {
  return (
    <div className="space-y-6">
      <ShellPageHeader title="LiNKsuitegen" subtitle="Suite factory — discovery, generation, validation, and Admin publish." />
      <LiNKsuitegenDashboard />
    </div>
  );
}
