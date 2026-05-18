import { CockpitDashboard } from "@/components/cockpit-dashboard";
import { loadCockpitDashboard } from "@/lib/cockpit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CockpitPage() {
  const supabase = await createSupabaseServerClient();

  // Get current tenant (for now, use a default/demo tenant)
  // In production, this would come from session/auth context
  const tenantId = "default";

  const data = await loadCockpitDashboard(supabase, tenantId);

  return <CockpitDashboard data={data} />;
}
