/**
 * Mission → Project API aliases (Phase A–C).
 *
 * JSON surfaces return **both** `projectId` and `missionId` with the same value while
 * routes and DB columns still use mission naming internally.
 *
 * @deprecated `missionId` on API JSON will be removed in Phase D (DB/RPC migration).
 * Prefer `projectId` in new clients.
 */

/** Same id under canonical (`projectId`) and legacy (`missionId`) keys. */
export function dualProjectMissionIdFields(id: string): { projectId: string; missionId: string } {
  const trimmed = id.trim();
  return { projectId: trimmed, missionId: trimmed };
}

/**
 * Resolve project/mission id from a parsed JSON object.
 * `projectId` wins when both are present (canonical for new clients).
 */
export function resolveMissionIdFromRecord(
  record: Record<string, unknown>,
): string | null {
  const projectId =
    typeof record.projectId === "string" && record.projectId.trim()
      ? record.projectId.trim()
      : null;
  const missionId =
    typeof record.missionId === "string" && record.missionId.trim()
      ? record.missionId.trim()
      : null;
  return projectId ?? missionId;
}

/** Attach `projectId` alongside an existing `missionId` on a response object. */
export function withProjectIdAlias<T extends { missionId: string }>(
  payload: T,
): T & { projectId: string } {
  return { ...payload, projectId: payload.missionId };
}

/** Attach `missionId` alongside an existing `projectId` on a response object. */
export function withMissionIdAlias<T extends { projectId: string }>(
  payload: T,
): T & { missionId: string } {
  return { ...payload, missionId: payload.projectId };
}
