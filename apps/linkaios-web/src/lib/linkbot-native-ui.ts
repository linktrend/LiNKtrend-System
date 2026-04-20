/** Base URL for LiNKbot native UI (new tab). Set in `.env.local` as `NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL`. */
export function linkbotNativeUiHref(agentId: string): string {
  const base = process.env.NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL?.replace(/\/$/, "");
  if (base) {
    const u = new URL(base);
    u.searchParams.set("agent", agentId);
    return u.toString();
  }
  return `/workers/${agentId}/native-ui`;
}
