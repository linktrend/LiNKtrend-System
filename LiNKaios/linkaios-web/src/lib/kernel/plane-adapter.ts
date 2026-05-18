import type { Env } from "@linktrend/shared-config";
import type { FailureCode } from "@linktrend/linklogic-sdk";

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

class ShadowReadinessPlaneAdapter implements PlaneAdapter {
  constructor(private readonly env: Env) {}

  async provisionProjectAndWorkItem(_: PlaneProvisionInput): Promise<PlaneProvisionResult> {
    const { baseUrl, workspaceSlug, apiKey } = validateReadinessEnv(this.env);

    await this.checkReadOnlyEndpoint(baseUrl, workspaceSlug, apiKey, `/api/workspaces/${encodeURIComponent(workspaceSlug)}`);
    await this.checkReadOnlyEndpoint(baseUrl, workspaceSlug, apiKey, `/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects/`);

    return {
      project_id: `plane-shadow-project-${Date.now()}`,
      task_id: `plane-shadow-task-${Date.now()}`,
    };
  }

  private async checkReadOnlyEndpoint(
    baseUrl: string,
    workspaceSlug: string,
    apiKey: string,
    path: string,
  ): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PLANE_READINESS_TIMEOUT_MS);

    try {
      const response = await fetch(new URL(path, withTrailingSlash(baseUrl)).toString(), {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          "X-Workspace-Slug": workspaceSlug,
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

function validateReadinessEnv(env: Env): {
  baseUrl: string;
  workspaceSlug: string;
  apiKey: string;
} {
  const baseUrl = env.PLANE_API_BASE_URL;
  const workspaceSlug = env.PLANE_WORKSPACE_SLUG;
  const apiKey = env.PLANE_API_KEY;

  const missing: string[] = [];
  if (!baseUrl) missing.push("PLANE_API_BASE_URL");
  if (!workspaceSlug) missing.push("PLANE_WORKSPACE_SLUG");
  if (!apiKey) missing.push("PLANE_API_KEY");

  if (missing.length > 0) {
    throw new PlaneReadinessError(
      "INTEGRATION_AUTH_FAILED",
      `Missing Plane readiness configuration: ${missing.join(", ")}`,
    );
  }

  return { baseUrl: baseUrl!, workspaceSlug: workspaceSlug!, apiKey: apiKey! };
}

function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

export function createPlaneAdapter(env: Env): PlaneAdapter {
  const mode = resolvePlaneMode(env);

  if (mode === "shadow_readiness") {
    return new ShadowReadinessPlaneAdapter(env);
  }

  // WP-033 safety guard: live mode still uses local stub behavior until remote-write cutover.
  if (mode === "live") {
    return new StubPlaneAdapter();
  }

  return new StubPlaneAdapter();
}
