import { AdminProjectsPage } from "@/components/admin/admin-projects-page";
import { loadAdminProjectIndexRows } from "@/lib/admin-projects-data";
import { getPlaneBridgeConfig, planeWorkspaceProjectsHref } from "@/lib/plane-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ blocked?: string }>;

export default async function AdminProjectsListPage(props: { searchParams: SearchParams }) {
  const sp = await props.searchParams;
  const blocked = sp.blocked === "create" ? "create" : sp.blocked === "detail" ? "detail" : null;

  const supabase = await createSupabaseServerClient();
  const { rows, error } = await loadAdminProjectIndexRows(supabase);
  const planeCfg = getPlaneBridgeConfig();

  return (
    <AdminProjectsPage
      rows={rows}
      planeWorkspaceHref={planeWorkspaceProjectsHref(planeCfg)}
      loadError={error}
      blocked={blocked}
    />
  );
}
