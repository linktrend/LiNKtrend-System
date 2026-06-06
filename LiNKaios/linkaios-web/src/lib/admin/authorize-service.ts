/**
 * Admin service-token authorization for LiNKsuitegen handoffs and factory dispatch.
 */

export function authorizeAdminServiceToken(req: Request): boolean {
  const expected = process.env.LINKAIOS_ADMIN_SERVICE_TOKEN?.trim();
  if (!expected) return false;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return Boolean(token && token === expected);
}

export function linksuitegenApiBaseUrl(): string {
  return (
    process.env.LINKSUITEGEN_API_URL?.trim() ||
    process.env.LINKSUITEGEN_SERVICE_URL?.trim() ||
    "http://127.0.0.1:3099"
  ).replace(/\/$/, "");
}
