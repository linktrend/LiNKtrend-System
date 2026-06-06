/**
 * Zulip channel communication profiles — fleet v1 OpenClaw agents.
 *
 * LiNKaios resolves `profile_id` → Zulip bot identity + stream/topic defaults.
 * Per-agent GSM secrets are preferred; shared ZULIP_BOT_* env vars are fallbacks
 * until per-profile bots are provisioned on VPS.
 */

import {
  FLEET_V1_OPENCLAW_AGENT_IDS,
  FLEET_V1_OPENCLAW_AGENTS,
  type FleetV1OpenClawAgentId,
  isFleetV1OpenClawAgentId,
} from "../../roles/platform/fleet-v1-openclaw.js";

/** Stable communication profile id for LiNKaios / bot-runtime routing. */
export type ZulipChannelProfileId =
  | "zulip.channel.admin-openclaw"
  | "zulip.channel.ceo-client"
  | "zulip.channel.linksites-head"
  | "zulip.channel.linkdeveloper-orchestrator"
  | "zulip.channel.linkdeveloper-steward";

export interface ZulipChannelProfile {
  profile_id: ZulipChannelProfileId;
  openclaw_agent_id: FleetV1OpenClawAgentId;
  tenant_kind: "admin" | "client";
  display_name: string;
  capability: "cap.zulip.run_messaging";
  bot_email_secret_name: string;
  bot_api_key_secret_name: string;
  bot_email_env_fallback: "ZULIP_BOT_EMAIL";
  bot_api_key_env_fallback: "ZULIP_BOT_API_KEY";
  default_stream_env: "ZULIP_RUN_STREAM";
  topic_template_env: "ZULIP_RUN_TOPIC_TEMPLATE";
}

const PROFILE_BY_AGENT: Record<FleetV1OpenClawAgentId, ZulipChannelProfile> = {
  [FLEET_V1_OPENCLAW_AGENTS.ADMIN]: {
    profile_id: "zulip.channel.admin-openclaw",
    openclaw_agent_id: FLEET_V1_OPENCLAW_AGENTS.ADMIN,
    tenant_kind: "admin",
    display_name: "Admin OpenClaw (vendor + LiNKsuitegen head)",
    capability: "cap.zulip.run_messaging",
    bot_email_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_EMAIL_ADMIN_OPENCLAW",
    bot_api_key_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_API_KEY_ADMIN_OPENCLAW",
    bot_email_env_fallback: "ZULIP_BOT_EMAIL",
    bot_api_key_env_fallback: "ZULIP_BOT_API_KEY",
    default_stream_env: "ZULIP_RUN_STREAM",
    topic_template_env: "ZULIP_RUN_TOPIC_TEMPLATE",
  },
  [FLEET_V1_OPENCLAW_AGENTS.CEO_CLIENT]: {
    profile_id: "zulip.channel.ceo-client",
    openclaw_agent_id: FLEET_V1_OPENCLAW_AGENTS.CEO_CLIENT,
    tenant_kind: "client",
    display_name: "Client CEO OpenClaw",
    capability: "cap.zulip.run_messaging",
    bot_email_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_EMAIL_CEO_CLIENT",
    bot_api_key_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_API_KEY_CEO_CLIENT",
    bot_email_env_fallback: "ZULIP_BOT_EMAIL",
    bot_api_key_env_fallback: "ZULIP_BOT_API_KEY",
    default_stream_env: "ZULIP_RUN_STREAM",
    topic_template_env: "ZULIP_RUN_TOPIC_TEMPLATE",
  },
  [FLEET_V1_OPENCLAW_AGENTS.LINKSITES_HEAD]: {
    profile_id: "zulip.channel.linksites-head",
    openclaw_agent_id: FLEET_V1_OPENCLAW_AGENTS.LINKSITES_HEAD,
    tenant_kind: "client",
    display_name: "LinkSites department head",
    capability: "cap.zulip.run_messaging",
    bot_email_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_EMAIL_LINKSITES_HEAD",
    bot_api_key_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_API_KEY_LINKSITES_HEAD",
    bot_email_env_fallback: "ZULIP_BOT_EMAIL",
    bot_api_key_env_fallback: "ZULIP_BOT_API_KEY",
    default_stream_env: "ZULIP_RUN_STREAM",
    topic_template_env: "ZULIP_RUN_TOPIC_TEMPLATE",
  },
  [FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_ORCHESTRATOR]: {
    profile_id: "zulip.channel.linkdeveloper-orchestrator",
    openclaw_agent_id: FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_ORCHESTRATOR,
    tenant_kind: "client",
    display_name: "LiNKdeveloper factory orchestrator",
    capability: "cap.zulip.run_messaging",
    bot_email_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_EMAIL_LINKDEVELOPER_ORCHESTRATOR",
    bot_api_key_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_API_KEY_LINKDEVELOPER_ORCHESTRATOR",
    bot_email_env_fallback: "ZULIP_BOT_EMAIL",
    bot_api_key_env_fallback: "ZULIP_BOT_API_KEY",
    default_stream_env: "ZULIP_RUN_STREAM",
    topic_template_env: "ZULIP_RUN_TOPIC_TEMPLATE",
  },
  [FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_STEWARD]: {
    profile_id: "zulip.channel.linkdeveloper-steward",
    openclaw_agent_id: FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_STEWARD,
    tenant_kind: "client",
    display_name: "LiNKdeveloper product steward",
    capability: "cap.zulip.run_messaging",
    bot_email_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_EMAIL_LINKDEVELOPER_STEWARD",
    bot_api_key_secret_name: "LINKTREND_AIOS_PROD_ZULIP_BOT_API_KEY_LINKDEVELOPER_STEWARD",
    bot_email_env_fallback: "ZULIP_BOT_EMAIL",
    bot_api_key_env_fallback: "ZULIP_BOT_API_KEY",
    default_stream_env: "ZULIP_RUN_STREAM",
    topic_template_env: "ZULIP_RUN_TOPIC_TEMPLATE",
  },
};

/** All fleet v1 Zulip channel profiles (one per OpenClaw agent). */
export const FLEET_V1_ZULIP_CHANNEL_PROFILES: ZulipChannelProfile[] = FLEET_V1_OPENCLAW_AGENT_IDS.map(
  (agentId) => PROFILE_BY_AGENT[agentId],
);

const PROFILE_BY_ID = Object.fromEntries(
  FLEET_V1_ZULIP_CHANNEL_PROFILES.map((profile) => [profile.profile_id, profile]),
) as Record<ZulipChannelProfileId, ZulipChannelProfile>;

/** Lookup Zulip channel profile by communication profile id. */
export function zulipChannelProfileById(profileId: string): ZulipChannelProfile | null {
  return PROFILE_BY_ID[profileId as ZulipChannelProfileId] ?? null;
}

/** Lookup Zulip channel profile by OpenClaw agentId. */
export function zulipChannelProfileForAgent(agentId: string): ZulipChannelProfile | null {
  if (!isFleetV1OpenClawAgentId(agentId)) {
    return null;
  }
  return PROFILE_BY_AGENT[agentId];
}

export interface GovernedZulipNotifyInput {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  role_id: string;
  notification_type: "started" | "completed" | "failed" | "awaiting_approval";
  message: string;
  lease_id?: string;
}

/** Payload shape consumed by `LiNKbot/communications/temporary-gateways/zulip` dispatch. */
export interface ZulipGatewayDispatchRequest {
  operation: "run.notify";
  tenant_id: string;
  capability: "cap.zulip.run_messaging";
  arguments: Record<string, unknown>;
  lease_id?: string;
  idempotency_key: string;
}

/** Build a governed `run.notify` dispatch request for a fleet profile (mock/live via gateway mode). */
export function buildGovernedZulipNotifyRequest(
  profile: ZulipChannelProfile,
  input: GovernedZulipNotifyInput,
): ZulipGatewayDispatchRequest {
  return {
    operation: "run.notify",
    tenant_id: input.tenant_id,
    capability: profile.capability,
    arguments: {
      notification_type: input.notification_type,
      message: input.message,
      role_id: input.role_id,
      openclaw_agent_id: profile.openclaw_agent_id,
      communication_profile_id: profile.profile_id,
      details: {
        tenant_kind: profile.tenant_kind,
        display_name: profile.display_name,
      },
    },
    lease_id: input.lease_id,
    idempotency_key: `${input.run_id}:${input.stage_id}:${profile.profile_id}:notify`,
  };
}
