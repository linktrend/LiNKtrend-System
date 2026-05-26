import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { postLoginDestination } from "@/lib/app-surface";
import { isLicensorOperator } from "@/lib/licensor-access";
import { allowAdminSurfaceForReview } from "@/lib/ui-mocks/flags";

/** Exchange Supabase auth code (OAuth / email link) for a session cookie. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const fail = new URL("/", url.origin);
      fail.searchParams.set("auth_error", "callback_failed");
      return NextResponse.redirect(fail);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const destination = postLoginDestination({
    isLicensor: isLicensorOperator(user?.email),
    nextPath: next,
    allowAdminDestination: allowAdminSurfaceForReview(),
  });

  return NextResponse.redirect(new URL(destination, url.origin));
}
