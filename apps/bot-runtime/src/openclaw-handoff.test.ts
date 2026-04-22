import { buildOpenClawAgentIngressBody } from "@linktrend/linklogic-sdk";
import type { Env } from "@linktrend/shared-config";
import type { LinktrendGovernancePayload } from "@linktrend/shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { postGovernanceToOpenClaw } from "./openclaw-handoff.js";

const gov: LinktrendGovernancePayload = {
  bootstrap: { traceCorrelationId: "tid", authorizationState: "granted" },
  approvedTools: { toolNames: [] },
};

describe("postGovernanceToOpenClaw", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve("{}"),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("when OPENCLAW_AGENT_RUN_URL unset, returns failure and does not fetch", async () => {
    const env = {} as Env;
    const r = await postGovernanceToOpenClaw(env, gov);
    expect(r).toMatchObject({ ok: false, status: 0, text: "OPENCLAW_AGENT_RUN_URL not set" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POSTs JSON derived from buildOpenClawAgentIngressBody (including linktrendGovernance)", async () => {
    const env = {
      OPENCLAW_AGENT_RUN_URL: "https://example.invalid/run",
      OPENCLAW_AGENT_RUN_BODY: "agent_params",
      OPENCLAW_AGENT_INGRESS_MESSAGE: "ping",
      OPENCLAW_AGENT_SESSION_KEY: "agent:main:main",
    } as unknown as Env;

    await postGovernanceToOpenClaw(env, gov);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(env.OPENCLAW_AGENT_RUN_URL);
    expect(init?.method).toBe("POST");
    const hdrs = init?.headers as Record<string, string>;
    expect(hdrs["content-type"]).toBe("application/json");

    const parsed = JSON.parse(init?.body as string);
    const expected = buildOpenClawAgentIngressBody(env, gov);
    expect(parsed.linktrendGovernance).toEqual(expected.linktrendGovernance);
    expect(parsed.message).toBe((expected as { message?: string }).message);
    expect(parsed.sessionKey).toBe((expected as { sessionKey?: string }).sessionKey);
    expect(typeof parsed.idempotencyKey).toBe("string");
  });

  it("includes Authorization Bearer when OPENCLAW_RUN_AUTH_BEARER is set", async () => {
    const env = {
      OPENCLAW_AGENT_RUN_URL: "https://example.invalid/run",
      OPENCLAW_RUN_AUTH_BEARER: "secret-token",
      OPENCLAW_AGENT_RUN_BODY: "agent_params",
      OPENCLAW_AGENT_INGRESS_MESSAGE: "ping",
      OPENCLAW_AGENT_SESSION_KEY: "agent:main:main",
    } as unknown as Env;

    await postGovernanceToOpenClaw(env, gov);

    const [, init] = fetchMock.mock.calls[0];
    const hdrs = init?.headers as Record<string, string>;
    expect(hdrs.authorization).toBe("Bearer secret-token");
  });

  it("aborts a hanging fetch using BOT_RUNTIME_HTTP_TIMEOUT_MS", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        const abortErr = Object.assign(new Error("Aborted"), { name: "AbortError" });
        if (signal?.aborted) {
          reject(abortErr);
          return;
        }
        signal?.addEventListener(
          "abort",
          () => {
            reject(abortErr);
          },
          { once: true },
        );
      });
    });

    const env = {
      OPENCLAW_AGENT_RUN_URL: "https://example.invalid/run",
      BOT_RUNTIME_HTTP_TIMEOUT_MS: "30",
      OPENCLAW_AGENT_RUN_BODY: "agent_params",
      OPENCLAW_AGENT_INGRESS_MESSAGE: "ping",
      OPENCLAW_AGENT_SESSION_KEY: "agent:main:main",
    } as unknown as Env;

    const r = await postGovernanceToOpenClaw(env, gov);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(0);
    expect(r.text).toMatch(/abort/i);
  });
});
