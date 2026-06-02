import type { Env } from "@linktrend/shared-config";
import { zulipRunMessagingMode } from "@linktrend/shared-config";

import type { ZulipGatewayConfig, ZulipMode } from "./types.js";

function normalizeBaseUrl(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return "http://localhost:9991";
  return trimmed.replace(/\/+$/, "");
}

/** Build gateway config from runtime env (GSM-rendered on VPS). */
export function loadZulipGatewayConfigFromEnv(env: Env): ZulipGatewayConfig {
  const mode = zulipRunMessagingMode(env) as ZulipMode;
  return {
    base_url: normalizeBaseUrl(env.ZULIP_SITE_URL),
    bot_email: env.ZULIP_BOT_EMAIL?.trim() || "linkbot@example.test",
    api_key: env.ZULIP_BOT_API_KEY?.trim() || "mock-api-key",
    default_stream: env.ZULIP_RUN_STREAM?.trim() || "linktrend-runs",
    topic_template: env.ZULIP_RUN_TOPIC_TEMPLATE?.trim() || "run-{run_id}",
    mode,
    requires_lease: env.ZULIP_GATEWAY_SKIP_LEASE !== "1",
    request_timeout_ms: Number(env.ZULIP_REQUEST_TIMEOUT_MS ?? 15_000) || 15_000,
  };
}

/** True when live sends are allowed and credentials are present. */
export function zulipLiveReady(env: Env): boolean {
  if (zulipRunMessagingMode(env) !== "live") return false;
  return Boolean(env.ZULIP_SITE_URL?.trim() && env.ZULIP_BOT_EMAIL?.trim() && env.ZULIP_BOT_API_KEY?.trim());
}
