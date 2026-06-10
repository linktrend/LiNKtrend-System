import { NextResponse } from "next/server";

import { getAppRoleTierForUser, isCommandCentreAdmin } from "@/lib/command-centre-access";
import { isLicensorOperator } from "@/lib/licensor-access";
import { runLinkguardManualCleanup } from "@/lib/linkguard-run-cleanup";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** POST /api/admin/linkguard/run-cleanup — licensor Admin/Super Admin manual residue sweep. */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isLicensorOperator(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [isAdmin, role] = await Promise.all([
    isCommandCentreAdmin(supabase, { userId: user.id, email: user.email }),
    getAppRoleTierForUser(supabase, { userId: user.id, email: user.email }),
  ]);

  if (!isAdmin || (role !== "admin" && role !== "super_admin")) {
    return NextResponse.json({ error: "Forbidden — Admin or Super Admin required" }, { status: 403 });
  }

  try {
    const result = await runLinkguardManualCleanup({ requestedBy: user.id });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cleanup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
