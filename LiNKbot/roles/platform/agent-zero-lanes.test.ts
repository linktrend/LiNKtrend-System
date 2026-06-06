import { describe, expect, it } from "vitest";

import {
  AGENT_ZERO_LANE_QUEUE_NAMES,
  FLEET_V1_AGENT_ZERO_LANE_IDS,
  FLEET_V1_AGENT_ZERO_LANES,
  isFleetV1AgentZeroLaneId,
  queueNameForLane,
} from "./agent-zero-lanes.js";

describe("agent-zero-lanes (Wave 2.3)", () => {
  it("declares eight fleet v1 lanes from STUDIO_FORWARD_PLAN §1.4", () => {
    expect(FLEET_V1_AGENT_ZERO_LANE_IDS).toHaveLength(8);
    expect(FLEET_V1_AGENT_ZERO_LANE_IDS).toEqual([
      "az-librarian",
      "az-suitegen-factory",
      "az-linksites-research",
      "az-linksites-build",
      "az-linkdeveloper-analysis",
      "az-linkdeveloper-architecture",
      "az-linkdeveloper-validation",
      "az-linkdeveloper-ops",
    ]);
  });

  it("assigns stable queue names per lane", () => {
    for (const laneId of FLEET_V1_AGENT_ZERO_LANE_IDS) {
      expect(queueNameForLane(laneId)).toBe(AGENT_ZERO_LANE_QUEUE_NAMES[laneId]);
      expect(queueNameForLane(laneId)).toMatch(/^linktrend\.az\./);
    }
    expect(queueNameForLane(FLEET_V1_AGENT_ZERO_LANES.LIBRARIAN)).toBe("linktrend.az.librarian");
  });

  it("validates lane ids", () => {
    expect(isFleetV1AgentZeroLaneId("az-librarian")).toBe(true);
    expect(isFleetV1AgentZeroLaneId("librarian")).toBe(false);
  });
});
