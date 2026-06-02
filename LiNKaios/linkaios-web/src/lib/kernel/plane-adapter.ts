import type { Env } from "@linktrend/shared-config";
import type { FailureCode } from "@linktrend/linklogic-sdk";

import { bootstrapPlaneProjectFromSuite } from "./plane-bootstrap";
import { planeV1WorkspacePath, resolvePlaneApiConfig } from "./plane-api-client";

export type PlaneMode = "stub" | "shadow_readiness" | "live";

export type PlaneProvisionInput = {
  tenant_id: string;
  lead_id: string;
  project_name: string;
  work_item_title: string;
  work_item_description?: string;
  owner_actor_id?: string;
  assignee_actor_id?: string;
};

export type PlaneProvisionResult = {
  project_id: string;
  task_id: string;
  project_identifier?: string;
};

export interface PlaneAdapter {
  provisionProjectAndWorkItem(input: PlaneProvisionInput): Promise<PlaneProvisionResult>;
}

export class PlaneReadinessError extends Error {
  constructor(
    public readonly failureCode: Extract<
      FailureCode,
      "INTEGRATION_AUTH_FAILED" | "INTEGRATION_UNAVAILABLE" | "INTEGRATION_TIMEOUT"
    >,
    message: string,
  ) {
    super(message);
    this.name = "PlaneReadinessError";
  }
}

const PLANE_READINESS_TIMEOUT_MS = 5000;

export function resolvePlaneMode(env: Env): PlaneMode {
  const mode = env.LINKSKILLS_PLANE_MODE;
  if (mode === "shadow_readiness" || mode === "live") return mode;
  return "stub";
}

class StubPlaneAdapter implements PlaneAdapter {
  async provisionProjectAndWorkItem(_: PlaneProvisionInput): Promise<PlaneProvisionResult> {
    return {
      project_id: `proj-${Date.now()}`,
      task_id: `task-${Date.now()}`,
    };
  }
}

class LivePlaneAdapter implements PlaneAdapter {
  constructor(private readonly env: Env) {}

  async provisionProjectAndWorkItem(input: PlaneProvisionInput): Promise<PlaneProvisionResult> {
    const leadId = input.lead_id?.trim() || `lead-${Date.now()}`;
    const projectName = input.project_name?.trim() || "LiNKaios project";
    const result = await bootstrapPlaneProjectFromSuite(this.env, {
      tenant_id: input.tenant_id,
      linkaios_project_id: leadId,
      project_title: projectName,
      suite_id: "linksites",
      module_ids: ["website-factory"],
      cadence: "once",
    });
    return {
      project_id: result.plane_project_id,
      task_id: result.task_id,
      project_identifier: result.plane_project_identifier,
    };
  }
}

class ShadowReadinessPlaneAdapter implements PlaneAdapter {
  constructor(private readonly env: Env) {}

  async provisionProjectAndWorkItem(_: PlaneProvisionInput): Promise<PlaneProvisionResult> {
    const config = validateReadinessEnv(this.env);

    await this.checkReadOnlyEndpoint(config, planeV1WorkspacePath(config, "/projects/"));

    return {
      project_id: `plane-shadow-project-${Date.now()}`,
      task_id: `plane-shadow-task-${Date.now()}`,
    };
  }

  private async checkReadOnlyEndpoint(config: ReturnType<typeof resolvePlaneApiConfig>, path: string): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PLANE_READINESS_TIMEOUT_MS);

    try {
      const response = await fetch(new URL(path, withTrailingSlash(config.baseUrl)).toString(), {
        method: "GET",
        headers: {
          "X-Api-Key": config.apiKey,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      if (response.status === 401 || response.status === 403) {
        throw new PlaneReadinessError("INTEGRATION_AUTH_FAILED", `Plane readiness auth failed (${response.status})`);
      }

      if (!response.ok) {
        throw new PlaneReadinessError(
          "INTEGRATION_UNAVAILABLE",
          `Plane readiness endpoint unavailable (${response.status})`,
        );
      }
    } catch (error) {
      if (error instanceof PlaneReadinessError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new PlaneReadinessError("INTEGRATION_TIMEOUT", "Plane readiness check timed out");
      }

      throw new PlaneReadinessError("INTEGRATION_UNAVAILABLE", "Plane readiness check failed");
    } finally {
      clearTimeout(timeout);
    }
  }
}

function validateReadinessEnv(env: Env) {
  return resolvePlaneApiConfig(env);
}

function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

export function createPlaneAdapter(env: Env): PlaneAdapter {
  const mode = resolvePlaneMode(env);

  if (mode === "shadow_readiness") {
    return new ShadowReadinessPlaneAdapter(env);
  }

  if (mode === "live") {
    return new LivePlaneAdapter(env);
  }

  return new StubPlaneAdapter();
}
