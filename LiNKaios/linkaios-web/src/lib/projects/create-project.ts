/**
 * Project creation service — stub body for pre-wiring sprint.
 *
 * Wiring sprint (PWR-W2+) replaces `createProjectStub` internals with:
 * - Supabase insert into missions/projects table
 * - LinkSkills lease for cap.plane.execution_tracking
 * - Plane bootstrap via studio-managed capability connector
 */

import { randomUUID } from "node:crypto";

import { getSuiteById } from "@/lib/suites-page-copy";
import { MODULES_CATALOG_DEMO, processesForModule } from "@/lib/ui-mocks/modules-catalog-demo";

import { withMissionIdAlias } from "@/lib/api/project-mission-id";

import { registerDemoProject } from "./demo-project-registry";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  CreateProjectValidationError,
  ProjectCadence,
} from "./types";
import { CreateProjectError } from "./types";

const MAX_NAME_LENGTH = 200;

function isCadence(value: unknown): value is ProjectCadence {
  return value === "once" || value === "continuous";
}

export function parseCreateProjectRequest(body: unknown): CreateProjectRequest {
  const details: CreateProjectValidationError[] = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new CreateProjectError("Invalid JSON body", 400);
  }

  const record = body as Record<string, unknown>;

  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) {
    details.push({ field: "name", message: "name is required" });
  } else if (name.length > MAX_NAME_LENGTH) {
    details.push({ field: "name", message: `name must be at most ${MAX_NAME_LENGTH} characters` });
  }

  const suiteId = typeof record.suiteId === "string" ? record.suiteId.trim() : "";
  if (!suiteId) {
    details.push({ field: "suiteId", message: "suiteId is required" });
  }

  const moduleIdsRaw = record.moduleIds;
  const moduleIds = Array.isArray(moduleIdsRaw)
    ? moduleIdsRaw.filter((id): id is string => typeof id === "string").map((id) => id.trim()).filter(Boolean)
    : null;
  if (!moduleIds || moduleIds.length === 0) {
    details.push({ field: "moduleIds", message: "moduleIds must be a non-empty array of strings" });
  }

  const cadenceRaw = record.cadence;
  if (!isCadence(cadenceRaw)) {
    details.push({ field: "cadence", message: 'cadence must be "once" or "continuous"' });
  }
  const cadence = isCadence(cadenceRaw) ? cadenceRaw : null;

  if (details.length > 0) {
    throw new CreateProjectError("Validation failed", 400, details);
  }

  const suite = suiteId ? getSuiteById(suiteId) : undefined;
  if (!suite) {
    throw new CreateProjectError("Unknown suiteId", 400, [{ field: "suiteId", message: "suite not found" }]);
  }

  const catalogue = processesForModule(suiteId).filter((p) => p.published);
  const catalogueIds = new Set(catalogue.map((p) => p.id));
  const unknownModules = (moduleIds ?? []).filter((id) => !catalogueIds.has(id));
  if (unknownModules.length > 0) {
    throw new CreateProjectError("Invalid moduleIds for suite", 400, [
      {
        field: "moduleIds",
        message: `unknown or unpublished modules for suite: ${unknownModules.join(", ")}`,
      },
    ]);
  }

  return {
    name,
    suiteId,
    moduleIds: moduleIds!,
    cadence: cadence!,
  };
}

export function createProjectStub(input: CreateProjectRequest): CreateProjectResponse {
  const suite = getSuiteById(input.suiteId)!;
  const catalogue = processesForModule(input.suiteId);
  const moduleNames = input.moduleIds.map(
    (id) => catalogue.find((p) => p.id === id)?.name ?? id,
  );

  const createdAt = new Date().toISOString();
  const projectId = `proj-${randomUUID()}`;

  registerDemoProject({
    projectId,
    request: input,
    suiteName: suite.name,
    moduleNames,
    processIds: [...input.moduleIds],
    createdAt,
  });

  return withMissionIdAlias({
    projectId,
    planeBootstrap: "stub",
    createdAt,
  });
}

/** Resolve suite/module labels for tests without hitting the registry. */
export function resolveSuiteModuleLabels(suiteId: string, moduleIds: string[]): string[] {
  const catalogue = MODULES_CATALOG_DEMO.processes;
  return moduleIds.map((id) => catalogue.find((p) => p.id === id)?.name ?? id);
}
