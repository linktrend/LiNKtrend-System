import { openExternalPopup } from "@/lib/zulip-links";

/** Optional bridge to a self-hosted Plane workspace (see https://plane.so). */

export type PlaneBridgeConfig = {
  /** Base URL with no trailing slash, e.g. https://plane.company.com */
  workspaceUrl: string | null;
  /** Optional workspace slug path segment after the host */
  workspaceSlug: string | null;
};

export function getPlaneBridgeConfig(): PlaneBridgeConfig {
  const raw = process.env.NEXT_PUBLIC_PLANE_URL?.trim();
  if (!raw) {
    return { workspaceUrl: null, workspaceSlug: null };
  }
  const workspaceUrl = raw.replace(/\/$/, "");
  const slug =
    process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG?.trim().replace(/^\/+|\/+$/g, "") ||
    process.env.PLANE_WORKSPACE_SLUG?.trim().replace(/^\/+|\/+$/g, "") ||
    null;
  return { workspaceUrl, workspaceSlug: slug };
}

/** Opens Plane in a new browser tab (same popup pattern as Zulip). */
export function openPlaneExternalUrl(url: string | null | undefined): void {
  if (!url) return;
  openExternalPopup(url);
}

/** Default “open workspace” link when no per-project mapping exists yet. */
export function planeWorkspaceProjectsHref(cfg: PlaneBridgeConfig): string | null {
  if (!cfg.workspaceUrl) return null;
  if (cfg.workspaceSlug) {
    return `${cfg.workspaceUrl}/${cfg.workspaceSlug}/projects/`;
  }
  return `${cfg.workspaceUrl}/`;
}

/** Per-project Plane board — uses project identifier or Plane project id from mapping. */
export function planeProjectBoardHref(cfg: PlaneBridgeConfig, projectCode: string | null | undefined): string | null {
  const workspace = planeWorkspaceProjectsHref(cfg);
  if (!workspace || !projectCode?.trim()) return workspace;
  const base = workspace.replace(/\/$/, "");
  return `${base}/${encodeURIComponent(projectCode.trim())}/`;
}

/** Direct URL when NEXT_PUBLIC_PLANE_* is set (preferred for live sync). */
export function planeProjectBoardHrefFromEnv(
  planeProjectId: string,
  identifier?: string | null,
): string | null {
  const cfg = getPlaneBridgeConfig();
  if (!cfg.workspaceUrl) return null;
  const slug = cfg.workspaceSlug ?? process.env.PLANE_WORKSPACE_SLUG?.trim();
  if (!slug) return null;
  const segment = identifier?.trim() || planeProjectId;
  return `${cfg.workspaceUrl}/${slug}/projects/${encodeURIComponent(segment)}/`;
}
