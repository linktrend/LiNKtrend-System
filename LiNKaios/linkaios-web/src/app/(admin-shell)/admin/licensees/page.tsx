import { AdminCompanyPage } from "@/components/admin/admin-company-page";
import { getChatwootOperatorConfig } from "@/lib/chatwoot-operator-config.server";

export default function AdminLicenseesRoutePage() {
  const chatwoot = getChatwootOperatorConfig();
  return (
    <AdminCompanyPage chatwootPublicUrl={chatwoot.publicUrl} chatwootAccountId={chatwoot.accountId} />
  );
}
