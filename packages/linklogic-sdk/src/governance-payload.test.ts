import { describe, expect, it } from "vitest";

import {
  buildOpenClawAgentIngressBody,
  toolNamesFromManifestPayload,
  wrapGovernanceForOpenClaw,
} from "./governance-payload.js";
import type { Env } from "@linktrend/shared-config";

describe("toolNamesFromManifestPayload", () => {
  it("reads approvedTools array", () => {
    expect(toolNamesFromManifestPayload({ approvedTools: ["read", "write"] })).toEqual([
      "read",
      "write",
    ]);
  });

  it("reads tools string array", () => {
    expect(toolNamesFromManifestPayload({ tools: ["a"] })).toEqual(["a"]);
  });

  it("returns empty for invalid", () => {
    expect(toolNamesFromManifestPayload(null)).toEqual([]);
  });
});

describe("wrapGovernanceForOpenClaw", () => {
  it("nests under linktrendGovernance", () => {
    const inner = {
      bootstrap: {
        traceCorrelationId: "t1",
        authorizationState: "granted" as const,
      },
      approvedTools: { toolNames: [] },
    };
    const wrapped = wrapGovernanceForOpenClaw(inner);
    expect(wrapped.linktrendGovernance.bootstrap?.traceCorrelationId).toBe("t1");
  });
});

describe("buildOpenClawAgentIngressBody", () => {
  const baseEnv = {
    OPENCLAW_AGENT_RUN_BODY: "agent_params",
    OPENCLAW_AGENT_INGRESS_MESSAGE: "ping",
    OPENCLAW_AGENT_SESSION_KEY: "agent:main:main",
  } as unknown as Env;

  it("defaults to flat agent params with linktrendGovernance", () => {
    const gov = {
      bootstrap: { authorizationState: "granted" as const, traceCorrelationId: "x" },
    };
    const body = buildOpenClawAgentIngressBody(baseEnv, gov);
    expect(body.message).toBe("ping");
    expect(typeof body.idempotencyKey).toBe("string");
    expect(body.sessionKey).toBe("agent:main:main");
    expect(body.linktrendGovernance).toEqual(gov);
  });

  it("supports governance_only", () => {
    const env = { ...baseEnv, OPENCLAW_AGENT_RUN_BODY: "governance_only" } as unknown as Env;
    const gov = { bootstrap: { authorizationState: "granted" as const } };
    const body = buildOpenClawAgentIngressBody(env, gov);
    expect(body).toEqual({ linktrendGovernance: gov });
  });
});
