import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const TEMPLATE_SCHEMA_VERSION = "1.0";

export type TemplateEnvironment = "development" | "staging" | "production";

export interface WorkflowTemplate {
  version: "1.0";
  templateVersion: string;
  handle: string;
  displayName: string;
  description: string;
  requiresLease: boolean;
  source:
    | { type: "inline"; handlerCode: string }
    | { type: "n8n"; n8nWorkflowId: string }
    | { type: "file"; filePath: string };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  environments: TemplateEnvironment[];
}

type RegistryRow = {
  key: string;
  template: WorkflowTemplate;
};

function templateKey(handle: string, templateVersion: string): string {
  return `${handle}@@${templateVersion}`;
}

function parseTemplateVersion(value: string): number[] {
  const parts = value.replace(/^v/i, "").split(".");
  return parts.map((part) => Number.parseInt(part, 10)).map((n) => Number.isFinite(n) ? n : 0);
}

function compareTemplateVersion(a: string, b: string): number {
  const left = parseTemplateVersion(a);
  const right = parseTemplateVersion(b);
  const maxLength = Math.max(left.length, right.length);
  for (let index = 0; index < maxLength; index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return a.localeCompare(b);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertIsoDate(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error(`Invalid template: ${fieldName} must be an ISO date string`);
  }
}

export class TemplateRegistry {
  private readonly templates = new Map<string, RegistryRow>();

  constructor(
    private readonly options: {
      loadTemplateFromN8n?: (workflowId: string) => Promise<WorkflowTemplate>;
    } = {},
  ) {}

  async loadFromFile(filePath: string): Promise<WorkflowTemplate> {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const validated = this.validateTemplate(parsed);
    this.register(validated);
    return validated;
  }

  async loadFromN8n(workflowId: string): Promise<WorkflowTemplate> {
    if (!this.options.loadTemplateFromN8n) {
      throw new Error("TemplateRegistry n8n loader is not configured");
    }
    const template = await this.options.loadTemplateFromN8n(workflowId);
    const validated = this.validateTemplate(template);
    if (validated.source.type !== "n8n") {
      throw new Error("Invalid template: n8n loader must return source.type='n8n'");
    }
    this.register(validated);
    return validated;
  }

  async loadAllFromDirectory(dirPath: string): Promise<WorkflowTemplate[]> {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const loaded: WorkflowTemplate[] = [];
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json") || entry.name === "schema.json") {
        continue;
      }
      const template = await this.loadFromFile(path.join(dirPath, entry.name));
      loaded.push(template);
    }
    return loaded;
  }

  register(template: WorkflowTemplate): void {
    const validated = this.validateTemplate(template);
    const key = templateKey(validated.handle, validated.templateVersion);
    this.templates.set(key, { key, template: validated });
  }

  get(handle: string, environment: TemplateEnvironment): WorkflowTemplate | undefined {
    const matches = Array.from(this.templates.values())
      .map((row) => row.template)
      .filter((template) => template.handle === handle && template.environments.includes(environment))
      .sort((a, b) => compareTemplateVersion(b.templateVersion, a.templateVersion));
    return matches[0];
  }

  list(environment?: TemplateEnvironment): WorkflowTemplate[] {
    const all = Array.from(this.templates.values()).map((row) => row.template);
    const filtered = environment
      ? all.filter((template) => template.environments.includes(environment))
      : all;
    return filtered.sort((a, b) => {
      const byHandle = a.handle.localeCompare(b.handle);
      if (byHandle !== 0) {
        return byHandle;
      }
      return compareTemplateVersion(b.templateVersion, a.templateVersion);
    });
  }

  listVersions(handle: string): string[] {
    return Array.from(this.templates.values())
      .map((row) => row.template)
      .filter((template) => template.handle === handle)
      .map((template) => template.templateVersion)
      .sort((a, b) => compareTemplateVersion(b, a));
  }

  async promote(handle: string, fromEnv: TemplateEnvironment, toEnv: TemplateEnvironment): Promise<void> {
    const template = this.get(handle, fromEnv);
    if (!template) {
      throw new Error(`Cannot promote template: ${handle} not found in ${fromEnv}`);
    }
    if (template.environments.includes(toEnv)) {
      return;
    }
    const promoted: WorkflowTemplate = {
      ...template,
      environments: [...template.environments, toEnv],
      updatedAt: new Date().toISOString(),
    };
    this.register(promoted);
  }

  private validateTemplate(raw: unknown): WorkflowTemplate {
    if (!isPlainObject(raw)) {
      throw new Error("Invalid template: expected an object");
    }

    const {
      version,
      templateVersion,
      handle,
      displayName,
      description,
      requiresLease,
      source,
      tags,
      createdAt,
      updatedAt,
      author,
      environments,
    } = raw;

    if (version !== TEMPLATE_SCHEMA_VERSION) {
      throw new Error(`Invalid template: version must be '${TEMPLATE_SCHEMA_VERSION}'`);
    }
    if (typeof templateVersion !== "string" || templateVersion.trim() === "") {
      throw new Error("Invalid template: templateVersion is required");
    }
    if (typeof handle !== "string" || handle.trim() === "") {
      throw new Error("Invalid template: handle is required");
    }
    if (typeof displayName !== "string" || displayName.trim() === "") {
      throw new Error("Invalid template: displayName is required");
    }
    if (typeof description !== "string" || description.trim() === "") {
      throw new Error("Invalid template: description is required");
    }
    if (typeof requiresLease !== "boolean") {
      throw new Error("Invalid template: requiresLease must be boolean");
    }
    if (!isPlainObject(source) || typeof source.type !== "string") {
      throw new Error("Invalid template: source.type is required");
    }

    let validatedSource: WorkflowTemplate["source"];
    if (source.type === "inline") {
      if (typeof source.handlerCode !== "string" || source.handlerCode.trim() === "") {
        throw new Error("Invalid template: inline source requires handlerCode");
      }
      validatedSource = { type: "inline", handlerCode: source.handlerCode };
    } else if (source.type === "n8n") {
      if (typeof source.n8nWorkflowId !== "string" || source.n8nWorkflowId.trim() === "") {
        throw new Error("Invalid template: n8n source requires n8nWorkflowId");
      }
      validatedSource = { type: "n8n", n8nWorkflowId: source.n8nWorkflowId };
    } else if (source.type === "file") {
      if (typeof source.filePath !== "string" || source.filePath.trim() === "") {
        throw new Error("Invalid template: file source requires filePath");
      }
      validatedSource = { type: "file", filePath: source.filePath };
    } else {
      throw new Error("Invalid template: unsupported source.type");
    }

    if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string" && tag.length > 0)) {
      throw new Error("Invalid template: tags must be a non-empty string array");
    }

    assertIsoDate(createdAt, "createdAt");
    assertIsoDate(updatedAt, "updatedAt");

    if (typeof author !== "string" || author.trim() === "") {
      throw new Error("Invalid template: author is required");
    }

    const allowedEnvironments: TemplateEnvironment[] = ["development", "staging", "production"];
    if (
      !Array.isArray(environments) ||
      environments.length === 0 ||
      !environments.every((env) => allowedEnvironments.includes(env as TemplateEnvironment))
    ) {
      throw new Error("Invalid template: environments must include valid deployment environments");
    }

    return {
      version: TEMPLATE_SCHEMA_VERSION,
      templateVersion,
      handle,
      displayName,
      description,
      requiresLease,
      source: validatedSource,
      tags,
      createdAt,
      updatedAt,
      author,
      environments: Array.from(new Set(environments as TemplateEnvironment[])),
    };
  }
}
