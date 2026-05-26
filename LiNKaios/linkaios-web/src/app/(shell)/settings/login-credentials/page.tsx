import { redirect } from "next/navigation";

import { LoginCredentialsPage } from "@/components/settings/login-credentials-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsLoginCredentialsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  return <LoginCredentialsPage email={user.email ?? "operator@linktrend.local"} />;
}
