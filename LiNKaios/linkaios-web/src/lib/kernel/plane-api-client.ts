import type { Env } from "@linktrend/shared-config";
import type { FailureCode } from "@linktrend/linklogic-sdk";

import { PlaneReadinessError } from "./plane-adapter";

export type PlaneApiConfig = {
  baseUrl: string;
  workspaceSlug: string;
  apiKey: string;
};

const PLANE_REQUEST_TIMEOUT_MS = 30_000;

export function resolvePlaneApiConfig(env: Env): PlaneApiConfig {
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
      `Missing Plane configuration: ${missing.join(", ")}`,
    );
  }

  return {
    baseUrl: baseUrl as string,
    workspaceSlug: workspaceSlug as string,
    apiKey: apiKey as string,
  };
}

function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function mapPlaneHttpFailure(status: number): PlaneReadinessError {
  if (status === 401) {
    return new PlaneReadinessError("INTEGRATION_AUTH_FAILED", `Plane API auth failed (${status})`);
  }
  if (status === 403) {
    return new PlaneReadinessError(
      "INTEGRATION_AUTH_FAILED",
      `Plane API key lacks workspace permission (${status})`,
    );
  }
  return new PlaneReadinessError("INTEGRATION_UNAVAILABLE", `Plane API unavailable (${status})`);
}

export async function planeApiRequest<T = Record<string, unknown>>(
  config: PlaneApiConfig,
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PLANE_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(new URL(path, withTrailingSlash(config.baseUrl)).toString(), {
      method,
      headers: {
        "X-Api-Key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw mapPlaneHttpFailure(response.status);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof PlaneReadinessError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new PlaneReadinessError("INTEGRATION_TIMEOUT", "Plane API request timed out");
    }
    throw new PlaneReadinessError("INTEGRATION_UNAVAILABLE", "Plane API request failed");
  } finally {
    clearTimeout(timeout);
  }
}

/** Contract API (service token) — preferred for live writes. */
export function planeV1WorkspacePath(config: PlaneApiConfig, suffix: string): string {
  const slug = encodeURIComponent(config.workspaceSlug);
  return `/api/v1/workspaces/${slug}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}

/** App API (session/UI) — used for shadow_readiness probes only. */
export function planeAppWorkspacePath(config: PlaneApiConfig, suffix: string): string {
  const slug = encodeURIComponent(config.workspaceSlug);
  return `/api/workspaces/${slug}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}

/** @deprecated Use planeV1WorkspacePath for live; planeAppWorkspacePath for shadow. */
export function planeWorkspacePath(config: PlaneApiConfig, suffix: string): string {
  return planeV1WorkspacePath(config, suffix);
}

export function integrationFailureFromPlane(
  error: unknown,
): { code: Extract<FailureCode, "INTEGRATION_AUTH_FAILED" | "INTEGRATION_UNAVAILABLE" | "INTEGRATION_TIMEOUT">; message: string } {
  if (error instanceof PlaneReadinessError) {
    return { code: error.failureCode, message: error.message };
  }
  return { code: "INTEGRATION_UNAVAILABLE", message: "Plane integration failed" };
}
