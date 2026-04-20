import { redirect } from "next/navigation";

import { ApiKeysPanel } from "@/app/(shell)/settings/api-keys/api-keys-panel";
import { listIntegrationSecretsAction } from "@/app/(shell)/settings/api-keys/actions";
import { isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsApiKeysPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const canManage = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });
  const list = canManage ? await listIntegrationSecretsAction() : { ok: false as const, error: "not admin" };
  const initialRows = list.ok ? list.rows : [];

  return (
    <div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <span className="text-zinc-900 dark:text-zinc-200">Settings</span>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-200">API Keys</span>
      </p>
      <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">API Keys</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        Store keys for integrations your workspace uses. Only Admins can view or edit this list.
      </p>
      <div className="mt-8">
        <ApiKeysPanel initialRows={initialRows} canManage={canManage} />
      </div>
    </div>
  );
}
