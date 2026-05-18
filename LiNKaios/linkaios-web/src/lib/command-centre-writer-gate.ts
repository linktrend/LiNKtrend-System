import "server-only";

import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function assertCommandCentreWriter() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { supabase, ok: false as const, error: "Not signed in." };
  }
  const role = await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email });
  if (!canWriteCommandCentre(role)) {
    return { supabase, ok: false as const, error: "Read-only: command centre writes are not allowed for your role." };
  }
  return { supabase, ok: true as const, error: undefined };
}
