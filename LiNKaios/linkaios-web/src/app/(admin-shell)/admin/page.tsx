import { AdminControlPanel } from "@/components/admin/admin-control-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  return (
    <>
      <ShellPageHeaderClient
        title="LiNKaios Admin"
        subtitle="Operate all licensees, services, and platform controls from one command centre."
      />
      <AdminControlPanel />
    </>
  );
}
