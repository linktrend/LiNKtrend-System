import { BillingPage } from "@/components/settings/billing-page";
import { LicensorTenantSettingsGuard } from "@/components/settings/licensor-tenant-settings-guard";

export const dynamic = "force-dynamic";

export default function SettingsBillingPage() {
  return (
    <LicensorTenantSettingsGuard redirectTo="/suites/billing">
      <BillingPage />
    </LicensorTenantSettingsGuard>
  );
}
