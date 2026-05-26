import { redirect } from "next/navigation";

import { OperatorProfilePage } from "@/components/settings/operator-profile-page";
import { getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { resolveOperatorAccessScope } from "@/lib/operator-access-scope";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsUserPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const role = await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email });

  const metadata = user.user_metadata ?? {};
  const displayName =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    null;
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;
  const email = user.email ?? "";
  const accessScope = resolveOperatorAccessScope({ email, role });

  return (
    <OperatorProfilePage
      email={email}
      displayName={displayName}
      avatarUrl={avatarUrl}
      accessScope={accessScope}
    />
  );
}
