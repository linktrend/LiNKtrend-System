import { AdminProjectsPage } from "@/components/admin/admin-projects-page";
import { ensureMinimalVendorProjectSeed } from "@/lib/admin-project-create";
import { loadAdminProjectIndexRows } from "@/lib/admin-projects-data";
import { getPlaneBridgeConfig, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProjectsListPage() {
  await ensureMinimalVendorProjectSeed();

  const supabase = await createSupabaseServerClient();
  const { rows, error } = await loadAdminProjectIndexRows(supabase);
  const planeCfg = getPlaneBridgeConfig();

  return (
    <AdminProjectsPage
      rows={rows}
      planeWorkspaceHref={planeWorkspaceProjectsHref(planeCfg)}
      loadError={error}
    />
  );
}
