import { IntegrationsSettingsPage } from "@/components/settings/integrations-settings-page";
import { LicensorIntegrationsGuard } from "@/components/settings/licensor-integrations-guard";

export const dynamic = "force-dynamic";

export default function SettingsIntegrationsPage() {
  return (
    <LicensorIntegrationsGuard>
      <IntegrationsSettingsPage />
    </LicensorIntegrationsGuard>
  );
}
