import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SessionActivityPage } from "@/components/settings/session-activity-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsSessionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading session activity…</p>}>
      <SessionActivityPage email={user.email ?? "operator@linktrend.local"} />
    </Suspense>
  );
}
