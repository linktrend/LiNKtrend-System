import { Suspense } from "react";

import { LicenseeSupportPanel } from "@/components/settings/licensee-support-panel";
import { LicensorTenantSettingsGuard } from "@/components/settings/licensor-tenant-settings-guard";

export const dynamic = "force-dynamic";

export default function SettingsSupportPage() {
  return (
    <LicensorTenantSettingsGuard redirectTo="/admin/licensees?tab=support">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading support…</p>}>
        <LicenseeSupportPanel />
      </Suspense>
    </LicensorTenantSettingsGuard>
  );
}
