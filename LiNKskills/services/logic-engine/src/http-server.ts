/**
 * LinkSkills logic-engine HTTP API (lease request / execute for bot-runtime and LiNKaios).
 */

import http from "node:http";
import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";
import type { Env } from "@linktrend/shared-config";
import type { LeaseDecision, LeaseExecuteRequest, LeaseRequest } from "@linktrend/linklogic-sdk";
import { requestLease } from "./lease-lifecycle.js";
import { executeGrantedLease } from "./execute-granted-lease.js";
import { getLease } from "./lease-lifecycle.js";

function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

function leaseDecisionFromRequestResult(result: Awaited<ReturnType<typeof requestLease>>): LeaseDecision {
  if (result.failure) {
    return {
      lease_id: result.lease_id || `denied-${Date.now()}`,
      status: "denied",
      reason: result.failure.message,
      kill_switch_state: result.kill_switch_state,
      failure: result.failure,
    };
  }

  const status: LeaseDecision["status"] =
    result.status === "granted" || result.status === "requires_approval" || result.status === "denied"
      ? result.status
      : "denied";

  return {
    lease_id: result.lease_id,
    status,
    kill_switch_state: result.kill_switch_state,
    expires_at:
      status === "granted"
        ? new Date(Date.now() + 300_000).toISOString()
        : undefined,
  };
}

export function createLinkSkillsHttpServer(env: Env): http.Server {
  const client = createSupabaseServiceClient(env);

  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    try {
      if (req.method === "GET" && url.pathname === "/health") {
        sendJson(res, 200, { status: "healthy", service: "linkskills-logic-engine" });
        return;
      }

      if (req.method === "POST" && url.pathname === "/leases/request") {
        const body = (await readJsonBody(req)) as LeaseRequest;
        const result = await requestLease(client, env, body);
        sendJson(res, 200, leaseDecisionFromRequestResult(result));
        return;
      }

      if (req.method === "POST" && url.pathname === "/leases/execute") {
        const body = (await readJsonBody(req)) as LeaseExecuteRequest;
        const exec = await executeGrantedLease(env, body);
        if (exec.failure) {
          sendJson(res, exec.failure.code === "LEASE_DENIED" ? 403 : 400, exec);
          return;
        }
        sendJson(res, 200, exec);
        return;
      }

      const statusMatch = url.pathname.match(/^\/leases\/([^/]+)\/status$/);
      if (req.method === "GET" && statusMatch) {
        const leaseId = decodeURIComponent(statusMatch[1] ?? "");
        const { data: lease } = await getLease(client, leaseId);
        if (!lease) {
          sendJson(res, 404, { error: "lease_not_found" });
          return;
        }
        const rawStatus = lease.status;
        const decisionStatus: LeaseDecision["status"] =
          rawStatus === "granted" || rawStatus === "requires_approval" || rawStatus === "denied"
            ? rawStatus
            : rawStatus === "executed"
              ? "granted"
              : "denied";
        const decision: LeaseDecision = {
          lease_id: lease.lease_id,
          status: decisionStatus,
          kill_switch_state: "open",
          expires_at: lease.expires_at,
        };
        sendJson(res, 200, decision);
        return;
      }

      sendJson(res, 404, { error: "not_found" });
    } catch (error) {
      log("error", "linkskills http handler error", {
        service: "linkskills-logic-engine",
        path: url.pathname,
        message: error instanceof Error ? error.message : String(error),
      });
      sendJson(res, 500, {
        error: "internal_error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

export function startLinkSkillsHttpServer(env: Env, port: number): http.Server {
  const server = createLinkSkillsHttpServer(env);
  server.listen(port, () => {
    log("info", "linkskills logic-engine listening", {
      service: "linkskills-logic-engine",
      port,
    });
  });
  return server;
}
