import { runtimeIdFromSettingsForNativeUi } from "@/lib/fleet-card-meta";

/**
 * Native operator UI URL for a LiNKbot.
 *
 * Pattern (OpenClaw gateway UI):
 *   `NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL` + `?agent={openclawAgentId}`
 *
 * Example:
 *   `https://linkbot.linktrend.internal:18789/?agent=admin-openclaw`
 *
 * Falls back to in-app placeholder when unset.
 */
export function linkbotNativeUiHref(agentId: string, runtimeSettings?: unknown): string {
  const base = process.env.NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL?.replace(/\/$/, "");
  const runtimeId = runtimeIdFromSettingsForNativeUi(runtimeSettings) ?? agentId;
  if (base) {
    const u = new URL(base.includes("://") ? base : `https://${base}`);
    u.searchParams.set("agent", runtimeId);
    return u.toString();
  }
  return `/workers/${agentId}/native-ui`;
}

export function linkbotNativeUiExternal(agentId: string, runtimeSettings?: unknown): boolean {
  return linkbotNativeUiHref(agentId, runtimeSettings).startsWith("http");
}
