import type { AddressInfo } from "node:net";
import { createServer } from "node:http";

import type { Env } from "@linktrend/shared-config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const upsertMock = vi.fn().mockResolvedValue({ error: null });

vi.mock("@linktrend/db", () => ({
  createSupabaseServiceClient: vi.fn(() => ({
    schema: (_schemaName: string) => ({
      from(table: string) {
        if (table === "zulip_message_links") {
          return { upsert: upsertMock };
        }
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        };
      },
    }),
  })),
}));

vi.mock("@linktrend/linklogic-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@linktrend/linklogic-sdk")>();
  return {
    ...actual,
    recordTrace: vi.fn().mockResolvedValue(undefined),
  };
});

describe("gateway-dispatch HTTP", () => {
  let server: ReturnType<typeof createServer>;
  let baseUrl: string;

  const env = {} as Env;

  beforeEach(async () => {
    upsertMock.mockClear();
    const { dispatch } = await import("./gateway-dispatch.js");
    server = createServer((req, res) => {
      void dispatch(req, res, env).catch((err) => {
        res.writeHead(500, { "content-type": "text/plain" });
        res.end(String(err));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("GET /health returns service json", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, service: "zulip-gateway" });
  });

  it("POST /webhooks/zulip rejects invalid JSON with 400", async () => {
    const res = await fetch(`${baseUrl}/webhooks/zulip`, {
      method: "POST",
      body: "not-json{",
      headers: { "content-type": "text/plain" },
    });
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe("invalid json");
  });

  it("POST /webhooks/zulip returns 422 when no message id", async () => {
    const res = await fetch(`${baseUrl}/webhooks/zulip`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ping: true }),
    });
    expect(res.status).toBe(422);
    await expect(res.text()).resolves.toBe("no message id");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("POST /webhooks/zulip upserts when message id present", async () => {
    const res = await fetch(`${baseUrl}/webhooks/zulip`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: 9001, stream_id: 3, topic: "t" }),
    });
    expect(res.status).toBe(200);
    await expect(res.text()).resolves.toBe("ok");
    expect(upsertMock).toHaveBeenCalled();
  });
});
