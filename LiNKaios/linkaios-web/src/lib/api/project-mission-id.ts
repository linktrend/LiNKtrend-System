/**
 * Mission → Project API aliases (Phase A–C).
 *
 * JSON surfaces return **both** `projectId` and `missionId` with the same value while
 * routes and DB columns still use mission naming internally.
 *
 * **Canonical:** `projectId` in new clients and component props.
 *
 * @deprecated `missionId` on API JSON will be removed in Phase D (DB/RPC migration).
 */

/** Same id under canonical (`projectId`) and legacy (`missionId`) keys. */
export function dualProjectMissionIdFields(id: string): { projectId: string; missionId: string } {
  const trimmed = id.trim();
  return { projectId: trimmed, missionId: trimmed };
}

/**
 * Resolve project id from a parsed JSON object.
 * `projectId` wins when both are present (canonical for new clients).
 */
export function resolveProjectIdFromRecord(
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

/** @deprecated Use {@link resolveProjectIdFromRecord}. */
export const resolveMissionIdFromRecord = resolveProjectIdFromRecord;

/**
 * Resolve project id from component props (`projectId` preferred).
 * Accepts legacy `missionId` during Phase C migration.
 */
export function resolveProjectIdFromProps(props: {
  projectId?: string | null;
  /** @deprecated Use projectId */
  missionId?: string | null;
}): string {
  const projectId = props.projectId?.trim();
  if (projectId) return projectId;
  return props.missionId?.trim() ?? "";
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
