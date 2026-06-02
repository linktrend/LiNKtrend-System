/**
 * Live operational probes for studio-provided capabilities (Plane, Zulip).
 * Used when LINKSKILLS_LIVE_OPS is enabled — shadow connectivity only, no writes.
 */

import type { Env } from "@linktrend/shared-config";

export type OperationalProbeResult = {
  ok: boolean;
  checked_at: string;
  target: string;
  http_status?: number | undefined;
  detail?: string | undefined;
};

export function isLinkSkillsLiveOpsEnabled(env: Env): boolean {
  const raw = env.LINKSKILLS_LIVE_OPS?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

function resolveZulipGatewayHealthUrl(env: Env): string | null {
  const notify = env.ZULIP_GATEWAY_NOTIFY_URL?.trim();
  if (notify) {
    try {
      const u = new URL(notify);
      return `${u.origin}/health`;
    } catch {
      return null;
    }
  }
  const port = env.ZULIP_GATEWAY_PORT?.trim() || "8790";
  return `http://zulip-gateway:${port}/health`;
}

export async function probeZulipGateway(env: Env): Promise<OperationalProbeResult> {
  const url = resolveZulipGatewayHealthUrl(env);
  const checked_at = new Date().toISOString();
  if (!url) {
    return { ok: false, checked_at, target: "zulip-gateway", detail: "Zulip gateway URL not configured" };
  }

  const timeoutMs = Number(env.ZULIP_REQUEST_TIMEOUT_MS ?? 15_000);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    const body = (await res.json().catch(() => ({}))) as { status?: string };
    const ok = res.ok && (body.status === "healthy" || body.status === "degraded");
    return {
      ok,
      checked_at,
      target: url,
      http_status: res.status,
      detail: typeof body.status === "string" ? body.status : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      checked_at,
      target: url,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function probePlaneApi(env: Env): Promise<OperationalProbeResult> {
  const base = env.PLANE_API_BASE_URL?.trim();
  const workspace = env.PLANE_WORKSPACE_SLUG?.trim();
  const apiKey = env.PLANE_API_KEY?.trim();
  const checked_at = new Date().toISOString();

  if (!base || !workspace || !apiKey) {
    return {
      ok: false,
      checked_at,
      target: "plane",
      detail: "Missing PLANE_API_BASE_URL, PLANE_WORKSPACE_SLUG, or PLANE_API_KEY",
    };
  }

  const url = `${base.replace(/\/+$/, "")}/api/v1/workspaces/${encodeURIComponent(workspace)}/`;
  const timeoutMs = 15_000;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "X-API-Key": apiKey, "content-type": "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    return {
      ok: res.ok,
      checked_at,
      target: url,
      http_status: res.status,
      detail: res.ok ? "workspace_reachable" : `http_${res.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      checked_at,
      target: url,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
