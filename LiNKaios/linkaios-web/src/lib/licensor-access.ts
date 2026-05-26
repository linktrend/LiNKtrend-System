import { redirect } from "next/navigation";

import { isBootstrapAdminEmail } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** LiNKtrend vendor operator (licensor) — not workspace Admin/Operator/Viewer roles. */
export function isLicensorOperator(email: string | null | undefined): boolean {
  return isBootstrapAdminEmail(email ?? undefined);
}

/** Redirect licensees away from licensor-only settings surfaces. */
export async function requireLicensorOperator(redirectTo = "/settings"): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");
  if (!isLicensorOperator(user.email)) redirect(redirectTo);
}
