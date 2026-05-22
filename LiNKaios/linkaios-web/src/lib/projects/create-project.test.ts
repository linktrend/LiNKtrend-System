import { afterEach, describe, expect, it } from "vitest";

import {
  clearDemoProjectRegistryForTests,
  getRegisteredDemoProjectDetailSpec,
} from "./demo-project-registry";
import { createProjectStub, parseCreateProjectRequest } from "./create-project";
import { CreateProjectError } from "./types";

afterEach(() => {
  clearDemoProjectRegistryForTests();
});

describe("parseCreateProjectRequest", () => {
  it("accepts a valid payload", () => {
    const input = parseCreateProjectRequest({
      name: "Acme preview site",
      suiteId: "linksites",
      moduleIds: ["website-factory"],
      cadence: "once",
    });
    expect(input).toEqual({
      name: "Acme preview site",
      suiteId: "linksites",
      moduleIds: ["website-factory"],
      cadence: "once",
    });
  });

  it("trims name and rejects empty name", () => {
    expect(() =>
      parseCreateProjectRequest({
        name: "   ",
        suiteId: "linksites",
        moduleIds: ["website-factory"],
        cadence: "once",
      }),
    ).toThrow(CreateProjectError);

    try {
      parseCreateProjectRequest({
        name: "   ",
        suiteId: "linksites",
        moduleIds: ["website-factory"],
        cadence: "once",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(CreateProjectError);
      const error = err as CreateProjectError;
      expect(error.status).toBe(400);
      expect(error.details?.some((d) => d.field === "name")).toBe(true);
    }
  });

  it("rejects unknown suiteId", () => {
    expect(() =>
      parseCreateProjectRequest({
        name: "Test",
        suiteId: "unknown-suite",
        moduleIds: ["website-factory"],
        cadence: "once",
      }),
    ).toThrow(CreateProjectError);
  });

  it("rejects moduleIds not in suite catalogue", () => {
    expect(() =>
      parseCreateProjectRequest({
        name: "Test",
        suiteId: "linksites",
        moduleIds: ["not-a-real-module"],
        cadence: "once",
      }),
    ).toThrow(CreateProjectError);
  });

  it("rejects invalid cadence", () => {
    expect(() =>
      parseCreateProjectRequest({
        name: "Test",
        suiteId: "linksites",
        moduleIds: ["website-factory"],
        cadence: "weekly",
      }),
    ).toThrow(CreateProjectError);
  });

  it("rejects missing moduleIds", () => {
    expect(() =>
      parseCreateProjectRequest({
        name: "Test",
        suiteId: "linksites",
        moduleIds: [],
        cadence: "continuous",
      }),
    ).toThrow(CreateProjectError);
  });
});

describe("createProjectStub", () => {
  it("returns projectId loadable from demo registry", () => {
    const input = parseCreateProjectRequest({
      name: "Northwind preview",
      suiteId: "linksites",
      moduleIds: ["website-factory"],
      cadence: "continuous",
    });

    const result = createProjectStub(input);

    expect(result.projectId).toMatch(/^proj-/);
    expect(result.planeBootstrap).toBe("stub");
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const spec = getRegisteredDemoProjectDetailSpec(result.projectId);
    expect(spec?.title).toBe("Northwind preview");
    expect(spec?.moduleName).toBe("LinkSites");
  });
});
