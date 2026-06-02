import { AdminControlPanel } from "@/components/admin/admin-control-panel";
import { MvoProofCard } from "@/components/mvo-proof-card";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { loadMvoProofSnapshot } from "@/lib/mvo-proof-snapshot";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createSupabaseServerClient();
  const mvoProof = await loadMvoProofSnapshot(supabase);

  return (
    <>
      <ShellPageHeaderClient
        title="LiNKaios Admin"
        subtitle="Operate all licensees, services, and platform controls from one command centre."
      />
      <div className="mb-8">
        <MvoProofCard snapshot={mvoProof} />
      </div>
      <AdminControlPanel />
    </>
  );
}
