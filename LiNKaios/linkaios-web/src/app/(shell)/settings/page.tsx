import { redirect } from "next/navigation";

import { SettingsPlatformPanel } from "@/components/settings/platform-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { SettingsHub } from "@/components/settings-hub";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsIndexPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const metadata = user.user_metadata ?? {};
  const displayName =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    null;
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  return (
    <>
      <ShellPageHeaderClient
        title="Settings"
        subtitle="Account, security, preferences, data integrations, and platform controls for your workspace."
      />
      <SettingsHub
        platformPanel={<SettingsPlatformPanel />}
        operatorEmail={user.email ?? ""}
        operatorDisplayName={displayName}
        operatorAvatarUrl={avatarUrl}
      />
    </>
  );
}
