import { afterEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/projects/route";

import { clearDemoProjectRegistryForTests, getRegisteredDemoProjectDetailSpec } from "./demo-project-registry";

afterEach(() => {
  clearDemoProjectRegistryForTests();
});

describe("POST /api/projects route", () => {
  it("returns 201 with projectId for valid body", async () => {
    const req = new Request("http://localhost/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Curl-ready project",
        suiteId: "linksites",
        moduleIds: ["website-factory"],
        cadence: "once",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = (await res.json()) as {
      projectId: string;
      planeBootstrap: string;
      createdAt: string;
    };

    expect(body.projectId).toMatch(/^proj-/);
    expect(body.planeBootstrap).toBe("stub");
    expect(getRegisteredDemoProjectDetailSpec(body.projectId)?.title).toBe("Curl-ready project");
  });

  it("returns 400 for invalid body", async () => {
    const req = new Request("http://localhost/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
