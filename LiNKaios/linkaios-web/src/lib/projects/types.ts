/** POST /api/projects — pre-wiring create contract (stub today). */

export type ProjectCadence = "once" | "continuous";

export type PlaneBootstrapStatus = "pending" | "stub";

export type CreateProjectRequest = {
  name: string;
  suiteId: string;
  moduleIds: string[];
  cadence: ProjectCadence;
};

export type CreateProjectResponse = {
  projectId: string;
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
