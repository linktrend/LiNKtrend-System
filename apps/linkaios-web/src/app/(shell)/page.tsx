import { OverviewHome } from "@/components/overview-home";
import { loadOverviewData } from "@/lib/overview-dashboard";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const data = await loadOverviewData(supabase, { uiMocksEnabled: isUiMocksEnabled() });
  return <OverviewHome data={data} />;
}
