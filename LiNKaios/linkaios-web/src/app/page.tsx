import Link from "next/link";
import { redirect } from "next/navigation";

import { postLoginDestination } from "@/lib/app-surface";
import { isBootstrapAdminEmail } from "@/lib/command-centre-shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { allowAdminSurfaceForReview } from "@/lib/ui-mocks/flags";

export const dynamic = "force-dynamic";

/** Root URL — licensee app entry redirects to the dedicated login page. */
export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    redirect(
      postLoginDestination({
        isLicensor: isBootstrapAdminEmail(user.email),
        allowAdminDestination: allowAdminSurfaceForReview(),
      }),
    );
  }

  redirect("/login");
}
