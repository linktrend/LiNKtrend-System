import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TemplateRegistry, type WorkflowTemplate } from "./template-registry.js";

const tempDirs: string[] = [];

async function createTempDir(prefix: string): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

const BASE_TEMPLATE: WorkflowTemplate = {
  version: "1.0",
  templateVersion: "v1",
  handle: "autowork.websitefactory.render",
  displayName: "WebsiteFactory Render",
  description: "Renders site artifact",
  requiresLease: false,
  source: {
    type: "file",
    filePath: "./handlers/websitefactory-render.js",
  },
  tags: ["websitefactory", "render"],
  createdAt: "2026-05-17T00:00:00.000Z",
  updatedAt: "2026-05-17T00:00:00.000Z",
  author: "WP-074",
  environments: ["development"],
};

describe("TemplateRegistry", () => {
  it("loads template from JSON", async () => {
    const dir = await createTempDir("template-registry-");
    const filePath = path.join(dir, "template.json");
    await writeFile(filePath, JSON.stringify(BASE_TEMPLATE), "utf8");

    const registry = new TemplateRegistry();
    const loaded = await registry.loadFromFile(filePath);

    expect(loaded.handle).toBe(BASE_TEMPLATE.handle);
    expect(registry.list()).toHaveLength(1);
  });

  it("fails validation for invalid template", async () => {
    const dir = await createTempDir("template-registry-invalid-");
    const filePath = path.join(dir, "template.json");
    await writeFile(
      filePath,
      JSON.stringify({
        ...BASE_TEMPLATE,
        source: { type: "n8n" },
      }),
      "utf8",
    );

    const registry = new TemplateRegistry();
    await expect(registry.loadFromFile(filePath)).rejects.toThrow(
      "Invalid template: n8n source requires n8nWorkflowId",
    );
  });

  it("loads all templates from directory and skips schema file", async () => {
    const dir = await createTempDir("template-registry-dir-");
    await writeFile(path.join(dir, "schema.json"), JSON.stringify({ type: "object" }), "utf8");
    await writeFile(path.join(dir, "a.json"), JSON.stringify(BASE_TEMPLATE), "utf8");
    await writeFile(
      path.join(dir, "b.json"),
      JSON.stringify({
        ...BASE_TEMPLATE,
        handle: "autowork.websitefactory.preview_serve",
        templateVersion: "v2",
        source: {
          type: "n8n",
          n8nWorkflowId: "wf-preview-serve-v2",
        },
      }),
      "utf8",
    );

    const registry = new TemplateRegistry();
    const loaded = await registry.loadAllFromDirectory(dir);

    expect(loaded).toHaveLength(2);
    expect(registry.list()).toHaveLength(2);
  });

  it("supports versioning and returns latest version per environment", () => {
    const registry = new TemplateRegistry();
    registry.register(BASE_TEMPLATE);
    registry.register({
      ...BASE_TEMPLATE,
      templateVersion: "v2",
      displayName: "WebsiteFactory Render V2",
      environments: ["development", "staging"],
    });

    expect(registry.listVersions(BASE_TEMPLATE.handle)).toEqual(["v2", "v1"]);
    expect(registry.get(BASE_TEMPLATE.handle, "development")?.templateVersion).toBe("v2");
    expect(registry.get(BASE_TEMPLATE.handle, "staging")?.templateVersion).toBe("v2");
    expect(registry.get(BASE_TEMPLATE.handle, "production")).toBeUndefined();
  });

  it("filters templates by environment", () => {
    const registry = new TemplateRegistry();
    registry.register(BASE_TEMPLATE);
    registry.register({
      ...BASE_TEMPLATE,
      handle: "autowork.websitefactory.preview_serve",
      templateVersion: "v1",
      environments: ["staging", "production"],
    });

    expect(registry.list("development").map((template) => template.handle)).toEqual([
      "autowork.websitefactory.render",
    ]);
    expect(registry.list("production").map((template) => template.handle)).toEqual([
      "autowork.websitefactory.preview_serve",
    ]);
  });

  it("promotes template between environments", async () => {
    const registry = new TemplateRegistry();
    registry.register(BASE_TEMPLATE);

    await registry.promote(BASE_TEMPLATE.handle, "development", "staging");

    const promoted = registry.get(BASE_TEMPLATE.handle, "staging");
    expect(promoted).toBeDefined();
    expect(promoted?.environments).toContain("development");
    expect(promoted?.environments).toContain("staging");
  });

  it("loads template from n8n loader", async () => {
    const registry = new TemplateRegistry({
      loadTemplateFromN8n: async (workflowId) => ({
        ...BASE_TEMPLATE,
        handle: "autowork.websitefactory.preview_serve",
        templateVersion: "v2",
        requiresLease: true,
        source: {
          type: "n8n",
          n8nWorkflowId: workflowId,
        },
      }),
    });

    const loaded = await registry.loadFromN8n("wf-preview-serve-v2");

    expect(loaded.source.type).toBe("n8n");
    if (loaded.source.type === "n8n") {
      expect(loaded.source.n8nWorkflowId).toBe("wf-preview-serve-v2");
    }
    expect(registry.listVersions("autowork.websitefactory.preview_serve")).toEqual(["v2"]);
  });
});
