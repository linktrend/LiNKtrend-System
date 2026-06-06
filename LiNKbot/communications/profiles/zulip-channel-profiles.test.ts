import { describe, expect, it } from "vitest";

import { dispatchGatewayOperation, DEFAULT_GATEWAY_CONFIG } from "../temporary-gateways/zulip/src/gateway-dispatch.js";
import { resetSendStats } from "../temporary-gateways/zulip/src/zulip-send.js";
import {
  FLEET_V1_ZULIP_CHANNEL_PROFILES,
  buildGovernedZulipNotifyRequest,
  zulipChannelProfileForAgent,
} from "./zulip-channel-profiles.js";

describe("fleet v1 Zulip channel profiles (Wave 1.4)", () => {
  const mockConfig = {
    ...DEFAULT_GATEWAY_CONFIG,
    mode: "mock" as const,
  };

  it("registers one profile per fleet OpenClaw agent", () => {
    expect(FLEET_V1_ZULIP_CHANNEL_PROFILES).toHaveLength(5);
    const agentIds = FLEET_V1_ZULIP_CHANNEL_PROFILES.map((p) => p.openclaw_agent_id).sort();
    expect(agentIds).toEqual([
      "admin-openclaw",
      "ceo-client",
      "linkdeveloper-orchestrator",
      "linkdeveloper-steward",
      "linksites-head",
    ]);
  });

  it("uses stable communication profile ids", () => {
    const profileIds = FLEET_V1_ZULIP_CHANNEL_PROFILES.map((p) => p.profile_id).sort();
    expect(profileIds).toEqual([
      "zulip.channel.admin-openclaw",
      "zulip.channel.ceo-client",
      "zulip.channel.linkdeveloper-orchestrator",
      "zulip.channel.linkdeveloper-steward",
      "zulip.channel.linksites-head",
    ]);
  });

  it("performs governed mock send smoke for each fleet agent", async () => {
    resetSendStats();
    for (const profile of FLEET_V1_ZULIP_CHANNEL_PROFILES) {
      const request = buildGovernedZulipNotifyRequest(profile, {
        tenant_id: "linktrend",
        run_id: `run-${profile.openclaw_agent_id}`,
        stage_id: "wave1-smoke",
        role_id: "fleet_smoke",
        notification_type: "started",
        message: `Wave 1 smoke for ${profile.openclaw_agent_id}`,
        lease_id: "lease-smoke",
      });

      expect(request.capability).toBe("cap.zulip.run_messaging");
      expect(request.arguments.communication_profile_id).toBe(profile.profile_id);

      const result = await dispatchGatewayOperation(request, mockConfig);
      expect(result.success).toBe(true);
      expect(result.operation).toBe("run.notify");
      expect(result.result).toHaveProperty("mock_sent", true);
    }
  });

  it("resolves profile by OpenClaw agentId", () => {
    const profile = zulipChannelProfileForAgent("linksites-head");
    expect(profile?.profile_id).toBe("zulip.channel.linksites-head");
    expect(profile?.tenant_kind).toBe("client");
    expect(zulipChannelProfileForAgent("unknown-agent")).toBeNull();
  });
});
