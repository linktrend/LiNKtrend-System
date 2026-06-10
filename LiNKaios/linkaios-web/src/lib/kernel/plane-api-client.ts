import type { Env } from "@linktrend/shared-config";
import type { FailureCode } from "@linktrend/linklogic-sdk";
import http from "node:http";
import https from "node:https";

import { PlaneReadinessError } from "./plane-adapter";

export type PlaneApiConfig = {
  baseUrl: string;
  workspaceSlug: string;
  apiKey: string;
  tlsInsecure: boolean;
};

const PLANE_REQUEST_TIMEOUT_MS = 30_000;

function planeTlsInsecure(env: Env): boolean {
  const raw = env.PLANE_TLS_INSECURE;
  if (!raw) return false;
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

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
    tlsInsecure: planeTlsInsecure(env),
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

type PlaneHttpResponse = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
};

async function planeHttpRequest(
  config: PlaneApiConfig,
  method: "GET" | "POST" | "PATCH",
  url: string,
  body?: Record<string, unknown>,
): Promise<PlaneHttpResponse> {
  const target = new URL(url);
  const payload = body ? JSON.stringify(body) : undefined;
  const headers: Record<string, string> = {
    "X-Api-Key": config.apiKey,
    "content-type": "application/json",
    ...(payload ? { "content-length": String(Buffer.byteLength(payload)) } : {}),
  };
  const lib = target.protocol === "https:" ? https : http;
  const requestOptions: https.RequestOptions = {
    method,
    hostname: target.hostname,
    port: target.port || (target.protocol === "https:" ? 443 : 80),
    path: `${target.pathname}${target.search}`,
    headers,
    rejectUnauthorized: !config.tlsInsecure,
  };

  return new Promise((resolve, reject) => {
    const req = lib.request(requestOptions, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        const status = res.statusCode ?? 500;
        resolve({
          ok: status >= 200 && status < 300,
          status,
          text: async () => text,
        });
      });
    });
    req.setTimeout(PLANE_REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error("Plane request timed out"));
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function parsePlaneHttpResponse<T>(response: PlaneHttpResponse): Promise<T> {
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
}

async function planeFetchRequest(
  config: PlaneApiConfig,
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: Record<string, unknown>,
): Promise<PlaneHttpResponse> {
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

    return {
      ok: response.ok,
      status: response.status,
      text: () => response.text(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function planeApiRequest<T = Record<string, unknown>>(
  config: PlaneApiConfig,
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const url = new URL(path, withTrailingSlash(config.baseUrl)).toString();

  try {
    const response = config.tlsInsecure
      ? await planeHttpRequest(config, method, url, body)
      : await planeFetchRequest(config, method, path, body);

    return await parsePlaneHttpResponse<T>(response);
  } catch (error) {
    if (error instanceof PlaneReadinessError) {
      throw error;
    }
    if (error instanceof Error && (error.name === "AbortError" || error.message === "Plane request timed out")) {
      throw new PlaneReadinessError("INTEGRATION_TIMEOUT", "Plane API request timed out");
    }
    throw new PlaneReadinessError("INTEGRATION_UNAVAILABLE", "Plane API request failed");
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
