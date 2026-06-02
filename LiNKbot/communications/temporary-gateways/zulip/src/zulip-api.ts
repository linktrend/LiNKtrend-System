import type { ZulipGatewayConfig } from "./types.js";

export type ZulipStreamInfo = {
  stream_id: number;
  name: string;
};

export type ZulipSendMessageResult = {
  id: number;
  result: string;
};

function authHeader(config: Pick<ZulipGatewayConfig, "bot_email" | "api_key">): string {
  const token = Buffer.from(`${config.bot_email}:${config.api_key}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

function apiBase(config: Pick<ZulipGatewayConfig, "base_url">): string {
  return config.base_url.replace(/\/+$/, "");
}

function tlsInsecure(): boolean {
  return process.env.ZULIP_TLS_INSECURE === "1" || process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0";
}

async function zulipFetch(
  config: ZulipGatewayConfig,
  path: string,
  init: RequestInit & { form?: Record<string, string> } = {},
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", authHeader(config));

  let body: string | undefined = init.body as string | undefined;
  if (init.form) {
    headers.set("content-type", "application/x-www-form-urlencoded");
    body = new URLSearchParams(init.form).toString();
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
    body,
    signal: AbortSignal.timeout(config.request_timeout_ms),
  };

  if (tlsInsecure()) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const response = await fetch(`${apiBase(config)}${path}`, requestInit);

  let parsed: unknown = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  return { ok: response.ok, status: response.status, body: parsed };
}

/** Authenticated connectivity probe via `/api/v1/users/me`. */
export async function probeZulipAuthenticated(config: ZulipGatewayConfig): Promise<{
  reachable: boolean;
  authenticated: boolean;
  latency_ms: number;
  error?: string;
  user_id?: number;
}> {
  const start = Date.now();
  try {
    const result = await zulipFetch(config, "/api/v1/users/me", { method: "GET" });
    const latency_ms = Date.now() - start;
    if (!result.ok) {
      return {
        reachable: true,
        authenticated: false,
        latency_ms,
        error: `HTTP ${result.status}`,
      };
    }
    const body = result.body as { user_id?: number } | null;
    return {
      reachable: true,
      authenticated: true,
      latency_ms,
      user_id: body?.user_id,
    };
  } catch (error) {
    return {
      reachable: false,
      authenticated: false,
      latency_ms: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Resolve stream by exact name; returns null when not found. */
export async function getStreamByName(
  config: ZulipGatewayConfig,
  streamName: string,
): Promise<ZulipStreamInfo | null> {
  const url = `${apiBase(config)}/api/v1/get_stream_id?stream=${encodeURIComponent(streamName)}`;
  if (tlsInsecure()) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: authHeader(config) },
    signal: AbortSignal.timeout(config.request_timeout_ms),
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { stream_id?: number };
  if (typeof body.stream_id !== "number") return null;
  return { stream_id: body.stream_id, name: streamName };
}

/** Create a stream (public within org) and subscribe the bot. */
export async function createProjectStream(
  config: ZulipGatewayConfig,
  streamName: string,
  description: string,
): Promise<ZulipStreamInfo> {
  const existing = await getStreamByName(config, streamName);
  if (existing) return existing;

  const create = await zulipFetch(config, "/api/v1/users/me/subscriptions", {
    method: "POST",
    form: {
      subscriptions: JSON.stringify([{ name: streamName, description }]),
    },
  });

  if (!create.ok) {
    const msg =
      create.body && typeof create.body === "object" && "msg" in create.body
        ? String((create.body as { msg: unknown }).msg)
        : `HTTP ${create.status}`;
    throw new Error(`Zulip stream create failed: ${msg}`);
  }

  const created = await getStreamByName(config, streamName);
  if (!created) {
    throw new Error(`Zulip stream "${streamName}" created but stream_id lookup failed`);
  }
  return created;
}

/** Send a stream message; returns Zulip message id. */
export async function sendStreamMessage(
  config: ZulipGatewayConfig,
  params: { stream: string; topic: string; content: string },
): Promise<ZulipSendMessageResult> {
  const result = await zulipFetch(config, "/api/v1/messages", {
    method: "POST",
    form: {
      type: "stream",
      to: params.stream,
      topic: params.topic,
      content: params.content,
    },
  });

  if (!result.ok) {
    const msg =
      result.body && typeof result.body === "object" && "msg" in result.body
        ? String((result.body as { msg: unknown }).msg)
        : `HTTP ${result.status}`;
    throw new Error(`Zulip send failed: ${msg}`);
  }

  const body = result.body as { id?: number; result?: string };
  if (typeof body.id !== "number") {
    throw new Error("Zulip send returned no message id");
  }
  return { id: body.id, result: body.result ?? "success" };
}
