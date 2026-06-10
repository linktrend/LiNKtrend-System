/** Live Plane project presence — used to align LiNKaios lifecycle with Plane where API allows. */
export type PlaneProjectLiveState = "active" | "archived" | "unmapped" | "unknown";

/**
 * Resolve operator-facing project status (DB + optional Plane live state).
 * Draft stays Draft until launch; archived Plane projects map to Archived.
 */
export function resolveEffectiveProjectStatus(
  dbStatus: string,
  planeState: PlaneProjectLiveState,
): string {
  const normalized = dbStatus.toLowerCase();
  if (normalized === "draft") return "draft";

  if (planeState === "archived") return "archived";
  if (planeState === "active") {
    if (normalized === "completed" || normalized === "cancelled" || normalized === "failed") {
      return normalized;
    }
    if (normalized === "archived") return "archived";
    return normalized === "draft" ? "assigned" : normalized;
  }

  if (planeState === "unmapped") return dbStatus;

  // Plane API unavailable — fall back to DB lifecycle.
  return dbStatus;
}

/** Infer Plane live state from GET project result and mapping presence. */
export function planeLiveStateFromRemote(
  remoteFound: boolean,
  hasMapping: boolean,
): PlaneProjectLiveState {
  if (!hasMapping) return "unmapped";
  if (remoteFound) return "active";
  return "archived";
}
