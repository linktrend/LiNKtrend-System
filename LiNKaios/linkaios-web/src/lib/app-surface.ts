/** LiNKaios licensee vs licensor (admin) application surfaces — same repo, different URL prefix. */

export const ADMIN_BASE_PATH = "/admin";
export const LICENSEE_HOME_PATH = "/app";
export const LICENSEE_LOGIN_PATH = "/login";
export const ADMIN_LOGIN_PATH = "/admin/login";

export type AppSurface = "licensee" | "admin";

export function appBasePath(surface: AppSurface): string {
  return surface === "admin" ? ADMIN_BASE_PATH : "";
}

export function isAdminPathname(pathname: string): boolean {
  return pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`);
}

export function stripAppBasePath(pathname: string): string {
  if (pathname === ADMIN_BASE_PATH) return "/";
  if (pathname.startsWith(`${ADMIN_BASE_PATH}/`)) {
    const rest = pathname.slice(ADMIN_BASE_PATH.length);
    return rest || "/";
  }
  return pathname;
}

/** Prefix internal app paths for the active surface (`/` → `/admin` on admin). */
export function withAppBasePath(path: string, surface: AppSurface): string {
  const [pathPart, queryPart] = path.split("?");
  const normalized = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  let prefixed: string;
  if (surface === "licensee") {
    if (normalized === "/") {
      prefixed = LICENSEE_HOME_PATH;
    } else if (isAdminPathname(normalized)) {
      prefixed = stripAppBasePath(normalized);
    } else {
      prefixed = normalized;
    }
  } else if (isAdminPathname(normalized)) {
    prefixed = normalized;
  } else if (normalized === "/") {
    prefixed = ADMIN_BASE_PATH;
  } else {
    prefixed = `${ADMIN_BASE_PATH}${normalized}`;
  }
  return queryPart ? `${prefixed}?${queryPart}` : prefixed;
}

/** Licensor-only routes on the licensee surface — redirect to admin mirror. */
const LICENSOR_ONLY_LICENSEE_PREFIXES = [
  "/settings/tools",
  "/settings/traces",
  "/settings/gateway",
  "/settings/linkguard",
  "/settings/governance",
  "/settings/platform",
  "/settings/advanced",
  "/devtools/mvo-proof",
  "/devtools/governance",
] as const;

export function isLicensorOnlyLicenseePath(pathname: string): boolean {
  const route = stripAppBasePath(pathname);
  return LICENSOR_ONLY_LICENSEE_PREFIXES.some((p) => route === p || route.startsWith(`${p}/`));
}

export function licensorMirrorPath(licenseePath: string): string {
  const route = stripAppBasePath(licenseePath.startsWith("/") ? licenseePath : `/${licenseePath}`);
  return withAppBasePath(route, "admin");
}

export function postLoginDestination(params: {
  isLicensor: boolean;
  nextPath?: string | null;
  /** UI review / dev — allow explicit `/admin` even for licensee accounts. */
  allowAdminDestination?: boolean;
}): string {
  const next = params.nextPath?.trim();
  const mayUseAdmin = params.isLicensor || params.allowAdminDestination;
  if (next?.startsWith("/")) {
    if (next === "/" || next === LICENSEE_LOGIN_PATH || next === ADMIN_LOGIN_PATH) {
      return mayUseAdmin ? ADMIN_BASE_PATH : LICENSEE_HOME_PATH;
    }
    if (!mayUseAdmin && isAdminPathname(next)) return LICENSEE_HOME_PATH;
    return next;
  }
  return mayUseAdmin ? ADMIN_BASE_PATH : LICENSEE_HOME_PATH;
}

export function isPublicLegalPath(pathname: string): boolean {
  return pathname === "/legal/terms" || pathname === "/legal/privacy";
}

export function isPublicLandingPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === LICENSEE_LOGIN_PATH ||
    pathname.startsWith("/login/") ||
    pathname === ADMIN_LOGIN_PATH ||
    isPublicLegalPath(pathname)
  );
}
