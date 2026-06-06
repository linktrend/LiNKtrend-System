import { describe, expect, it } from "vitest";

import {
  agentZeroLaneForPlatformLibrarianRole,
  PLATFORM_LIBRARIAN_AGENT_ZERO_LANE,
} from "./agent-zero-mapping.js";

describe("platform librarian agent-zero-mapping (Wave 2.4)", () => {
  it("maps librarian_bot to az-librarian", () => {
    expect(agentZeroLaneForPlatformLibrarianRole("librarian_bot")).toBe(PLATFORM_LIBRARIAN_AGENT_ZERO_LANE);
    expect(PLATFORM_LIBRARIAN_AGENT_ZERO_LANE).toBe("az-librarian");
  });

  it("returns null for non-librarian roles", () => {
    expect(agentZeroLaneForPlatformLibrarianRole("ceo_client_linkbot")).toBeNull();
  });
});
