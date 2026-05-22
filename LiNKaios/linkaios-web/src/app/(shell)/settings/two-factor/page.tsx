import { redirect } from "next/navigation";

import { TwoFactorPage } from "@/components/settings/two-factor-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsTwoFactorPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  return <TwoFactorPage />;
}
