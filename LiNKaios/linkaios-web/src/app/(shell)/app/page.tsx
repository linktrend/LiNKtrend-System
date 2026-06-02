import { OverviewHome } from "@/components/overview-home";
import { loadOverviewData } from "@/lib/overview-dashboard";
import { loadMvoProofSnapshot } from "@/lib/mvo-proof-snapshot";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LicenseeHomePage() {
  const supabase = await createSupabaseServerClient();
  const [data, mvoProof] = await Promise.all([
    loadOverviewData(supabase, { uiMocksEnabled: isUiMocksEnabled() }),
    loadMvoProofSnapshot(supabase),
  ]);
  return <OverviewHome data={data} mvoProof={mvoProof} />;
}
