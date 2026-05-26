import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_BASE_PATH,
  ADMIN_LOGIN_PATH,
  isAdminPathname,
  isLicensorOnlyLicenseePath,
  isPublicLandingPath,
  LICENSEE_LOGIN_PATH,
  licensorMirrorPath,
  postLoginDestination,
} from "@/lib/app-surface";
import { LICENSEES_HUB_PATH } from "@/lib/company-page-copy";
import { isBootstrapAdminEmail } from "@/lib/command-centre-shared";
import { allowAdminSurfaceForReview } from "@/lib/ui-mocks/flags";

function isTruthy(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === LICENSEES_HUB_PATH || path.startsWith(`${LICENSEES_HUB_PATH}/`)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `${ADMIN_BASE_PATH}${path}`;
    return NextResponse.redirect(redirectUrl);
  }

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

  const isLanding = isPublicLandingPath(path);
  const isAuthPath = path.startsWith("/auth/");
  const isPublicHealth = path.startsWith("/api/health");
  const isPublicAuthLogin = path === "/api/auth/login";
  const isPublicBrainApi = path.startsWith("/api/brain/");
  const isInternalBrainEmbed = path.startsWith("/api/internal/brain-embed");
  const isInternalSkillEmbed = path.startsWith("/api/internal/skill-embed");
  const isPublicSkillsExecution = path.startsWith("/api/skills/execution");
  const kernelServiceSecret = process.env.BOT_KERNEL_API_SECRET?.trim();
  const isKernelServiceBypassEnabled = isTruthy(process.env.LINKAIOS_ENABLE_MVO_SERVICE_BYPASS);
  const isDevMode = process.env.NODE_ENV !== "production";
  const isDevAuthBypassEnabled = isTruthy(process.env.LINKAIOS_ENABLE_DEV_AUTH_BYPASS);
  const isDevAuthBypassRoute = isDevMode && isDevAuthBypassEnabled && !path.startsWith("/api/");
  const authHeader = request.headers.get("authorization");
  const isKernelServiceAuthorized =
    isKernelServiceBypassEnabled &&
    Boolean(kernelServiceSecret) &&
    authHeader === `Bearer ${kernelServiceSecret}`;
  const isKernelApiBypass = path.startsWith("/api/kernel") && isKernelServiceAuthorized;

  if (
    !user &&
    !isLanding &&
    !isAuthPath &&
    !isPublicHealth &&
    !isPublicAuthLogin &&
    !isPublicBrainApi &&
    !isInternalBrainEmbed &&
    !isInternalSkillEmbed &&
    !isPublicSkillsExecution &&
    !isKernelApiBypass &&
    !isDevAuthBypassRoute
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminPathname(path) ? ADMIN_LOGIN_PATH : LICENSEE_LOGIN_PATH;
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const isLicensor = isBootstrapAdminEmail(user.email);

    if (!isAdminPathname(path) && isLicensorOnlyLicenseePath(path)) {
      const redirectUrl = request.nextUrl.clone();
      const mirror = licensorMirrorPath(path);
      redirectUrl.pathname = mirror.split("?")[0] ?? mirror;
      const mirrorQs = mirror.includes("?") ? mirror.split("?")[1] : "";
      redirectUrl.search = mirrorQs ? `?${mirrorQs}` : request.nextUrl.search;
      return NextResponse.redirect(redirectUrl);
    }

    if (path === LICENSEE_LOGIN_PATH || path.startsWith("/login/") || path === ADMIN_LOGIN_PATH) {
      const redirectUrl = request.nextUrl.clone();
      const onAdminLogin = path === ADMIN_LOGIN_PATH;
      redirectUrl.pathname = postLoginDestination({
        isLicensor,
        nextPath: request.nextUrl.searchParams.get("next"),
        allowAdminDestination: allowAdminSurfaceForReview() || onAdminLogin,
      });
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
