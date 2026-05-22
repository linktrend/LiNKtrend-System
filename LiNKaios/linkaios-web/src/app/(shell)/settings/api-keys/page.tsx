import { ApiAccessSettingsPage } from "@/components/settings/api-access-settings-page";
import { listIntegrationSecretsAction } from "@/components/settings/integration-secrets-actions";
import { isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsApiKeysPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canManage =
    user?.id != null ? await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email }) : false;

  const secretsResult = canManage ? await listIntegrationSecretsAction() : null;
  const initialRows = secretsResult?.ok ? secretsResult.rows : [];

  return <ApiAccessSettingsPage initialIntegrationSecrets={initialRows} canManageSecrets={canManage} />;
}
