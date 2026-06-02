import { describe, expect, it } from "vitest";

import { phaseTopicName, projectStreamName } from "./zulip-bootstrap.js";

describe("zulip-bootstrap naming", () => {
  it("builds stable project stream names", () => {
    const name = projectStreamName("550e8400-e29b-41d4-a716-446655440000", "Calusa Demo Lead");
    expect(name).toMatch(/^project-calusa-demo-lead-/);
    expect(name.length).toBeLessThanOrEqual(60);
  });

  it("maps phase stage ids to topic labels", () => {
    expect(phaseTopicName("linksites.outreach")).toBe("phase-outreach");
  });
});
