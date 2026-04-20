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
  const slug = process.env.NEXT_PUBLIC_PLANE_WORKSPACE_SLUG?.trim().replace(/^\/+|\/+$/g, "") || null;
  return { workspaceUrl, workspaceSlug: slug };
}

/** Default “open workspace” link when no per-project mapping exists yet. */
export function planeWorkspaceProjectsHref(cfg: PlaneBridgeConfig): string | null {
  if (!cfg.workspaceUrl) return null;
  if (cfg.workspaceSlug) {
    return `${cfg.workspaceUrl}/${cfg.workspaceSlug}/projects/`;
  }
  return `${cfg.workspaceUrl}/`;
}
