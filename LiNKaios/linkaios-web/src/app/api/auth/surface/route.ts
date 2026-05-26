import { NextResponse } from "next/server";

import { allowAdminSurfaceForReview } from "@/lib/ui-mocks/flags";
import { isLicensorOperator } from "@/lib/licensor-access";
import { postLoginDestination } from "@/lib/app-surface";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Resolve post-login destination: licensor → `/admin`, licensee → `/`. */
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const isLicensor = isLicensorOperator(user.email);

  return NextResponse.json({
    isLicensor,
    destination: postLoginDestination({
      isLicensor,
      nextPath: next,
      allowAdminDestination: allowAdminSurfaceForReview(),
    }),
  });
}
