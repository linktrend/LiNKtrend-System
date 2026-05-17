import { listRegisteredWorkflows } from "./workflow-runner.js";

export type HealthStatus = "ok" | "degraded" | "error";

export interface HealthCheckDependencyResult {
  status: "ok" | "error";
  latencyMs?: number;
  message?: string;
}

export interface HealthCheckResult {
  status: HealthStatus;
  checks: {
    database: HealthCheckDependencyResult;
    idempotencyStore: HealthCheckDependencyResult;
    n8n?: HealthCheckDependencyResult;
  };
  workflowsRegistered: number;
  timestamp: string;
}

export interface HealthCheck {
  check(): Promise<HealthCheckResult>;
}

export function createHealthCheck(deps?: {
  checkDatabase?: () => Promise<HealthCheckDependencyResult>;
  checkIdempotencyStore?: () => Promise<HealthCheckDependencyResult>;
  checkN8n?: () => Promise<HealthCheckDependencyResult>;
  listWorkflows?: () => string[];
}): HealthCheck {
  return {
    async check(): Promise<HealthCheckResult> {
      const [database, idempotencyStore, n8n] = await Promise.all([
        deps?.checkDatabase?.() ?? Promise.resolve({ status: "ok" as const, latencyMs: 0 }),
        deps?.checkIdempotencyStore?.() ?? Promise.resolve({ status: "ok" as const }),
        deps?.checkN8n?.() ?? Promise.resolve(undefined),
      ]);

      const checks: HealthCheckResult["checks"] = {
        database,
        idempotencyStore,
      };

      if (n8n) {
        checks.n8n = n8n;
      }

      const statuses: Array<"ok" | "error"> = [database.status, idempotencyStore.status];
      if (n8n) statuses.push(n8n.status);

      let status: HealthStatus = "ok";
      if (statuses.every((entry) => entry === "error")) {
        status = "error";
      } else if (statuses.some((entry) => entry === "error")) {
        status = "degraded";
      }

      return {
        status,
        checks,
        workflowsRegistered: (deps?.listWorkflows ?? listRegisteredWorkflows)().length,
        timestamp: new Date().toISOString(),
      };
    },
  };
}
