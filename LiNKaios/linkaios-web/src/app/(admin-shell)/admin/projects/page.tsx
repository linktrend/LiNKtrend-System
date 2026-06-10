import { AdminProjectsPage } from "@/components/admin/admin-projects-page";
import { ensureMinimalVendorProjectSeed } from "@/lib/admin-project-create";
import { loadAdminProjectIndexRows } from "@/lib/admin-projects-data";
import { getPlaneBridgeConfig, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { projectSummaryColumnForStatus, type ProjectSummaryColumnKey } from "@/lib/project-status-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProjectsListPage() {
  await ensureMinimalVendorProjectSeed();

  const supabase = await createSupabaseServerClient();
  const { rows, error } = await loadAdminProjectIndexRows(supabase);
  const planeCfg = getPlaneBridgeConfig();

  const lifecycleCounts: Record<ProjectSummaryColumnKey, number> = {
    draft: 0,
    active: 0,
    archived: 0,
  };
  for (const row of rows) {
    lifecycleCounts[projectSummaryColumnForStatus(row.status)] += 1;
  }

  return (
    <AdminProjectsPage
      rows={rows}
      lifecycleCounts={lifecycleCounts}
      planeWorkspaceHref={planeWorkspaceProjectsHref(planeCfg)}
      loadError={error}
    />
  );
}
