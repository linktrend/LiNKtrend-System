import { NextResponse } from "next/server";

import { postLoginDestination } from "@/lib/app-surface";
import { isLicensorOperator } from "@/lib/licensor-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { allowAdminSurfaceForReview } from "@/lib/ui-mocks/flags";

export const dynamic = "force-dynamic";

/** Password sign-in — sets session cookies on the server, then returns redirect target. */
export async function POST(request: Request) {
  let body: { email?: string; password?: string; next?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;
  const next = body.next?.trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const destination = postLoginDestination({
    isLicensor: isLicensorOperator(user?.email),
    nextPath: next,
    allowAdminDestination: allowAdminSurfaceForReview(),
  });

  return NextResponse.json({ destination });
}
