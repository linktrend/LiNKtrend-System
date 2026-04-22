import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2]);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path === "/login" || path.startsWith("/login/");
  const isAuthPath = path.startsWith("/auth/");
  const isPublicHealth = path.startsWith("/api/health");
  const isPublicBrainApi = path.startsWith("/api/brain/");
  /** Cron / automation: handler validates `LINKAIOS_CRON_SECRET`; must not require operator cookies. */
  const isInternalBrainEmbed = path.startsWith("/api/internal/brain-embed");
  const isInternalSkillEmbed = path.startsWith("/api/internal/skill-embed");
  /** Handler validates `Authorization: Bearer` against `BOT_SKILLS_API_SECRET` or `BOT_BRAIN_API_SECRET` — not anonymous. */
  const isPublicSkillsExecution = path.startsWith("/api/skills/execution");

  if (
    !user &&
    !isLogin &&
    !isAuthPath &&
    !isPublicHealth &&
    !isPublicBrainApi &&
    !isInternalBrainEmbed &&
    !isInternalSkillEmbed &&
    !isPublicSkillsExecution
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isLogin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
