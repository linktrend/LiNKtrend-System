/**
 * POST /api/projects — pre-wiring create contract (stub today).
 *
 * Create responses expose `projectId` (canonical). Legacy `missionId` is not returned here
 * until other mission-keyed routes are unified; plane-sync and brain bridges use dual fields.
 *
 * @deprecated API JSON field `missionId` is removed in Phase D; use `projectId`.
 */

export type ProjectCadence = "once" | "continuous";

export type PlaneBootstrapStatus = "pending" | "stub" | "live";

export type CreateProjectRequest = {
  name: string;
  suiteId: string;
  moduleIds: string[];
  cadence: ProjectCadence;
};

export type CreateProjectResponse = {
  /** Canonical LiNKaios project id (Phase A–C wiring). */
  projectId: string;
  /**
   * Legacy alias — same value as `projectId`.
   * @deprecated Removed in Phase D; use `projectId`.
   */
  missionId: string;
  planeBootstrap: PlaneBootstrapStatus;
  createdAt: string;
};

export type CreateProjectValidationError = {
  field: string;
  message: string;
};

export class CreateProjectError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: CreateProjectValidationError[],
  ) {
    super(message);
    this.name = "CreateProjectError";
  }
}
