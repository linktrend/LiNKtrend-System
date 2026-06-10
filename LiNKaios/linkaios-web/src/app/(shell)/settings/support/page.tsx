import { Suspense } from "react";

import { LicenseeSupportPanel } from "@/components/settings/licensee-support-panel";
import { LicensorTenantSettingsGuard } from "@/components/settings/licensor-tenant-settings-guard";
import { resolveLicenseeIdForCompany } from "@/lib/licensor-licensee-profile";
import { loadSupportTicketsFromDb } from "@/lib/support-tickets-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ companyId?: string }>;
};

export default async function SettingsSupportPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const licenseeId = resolveLicenseeIdForCompany(searchParams.companyId ?? "xyz-marketing");
  const supabase = await createSupabaseServerClient();
  const loaded = await loadSupportTicketsFromDb(supabase, { licenseeId });

  return (
    <LicensorTenantSettingsGuard redirectTo="/admin/licensees?tab=support">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading support…</p>}>
        <LicenseeSupportPanel
          licenseeId={licenseeId}
          initialTickets={loaded.tickets}
          tableReady={loaded.tableReady}
        />
      </Suspense>
    </LicensorTenantSettingsGuard>
  );
}
