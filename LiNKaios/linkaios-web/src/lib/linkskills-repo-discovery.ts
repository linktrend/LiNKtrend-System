import fs from "node:fs";
import path from "node:path";

export type RepoCapabilityCandidate = {
  repoSlug: string;
  pluginId: string;
  name: string;
  version: string;
  manifestPath: string;
  status: "implemented" | "declared" | "pending";
};

export type RepoToolCandidate = {
  repoSlug: string;
  name: string;
  toolType: string;
  category: string;
  description: string;
  manifestPath: string;
  implementation: Record<string, unknown>;
};

function repoRootFromWebCwd(): string {
  const cwd = process.cwd();
  if (cwd.endsWith("linkaios-web")) {
    return path.resolve(cwd, "../..");
  }
  return path.resolve(cwd);
}

function linkskillsRoot(): string {
  return path.join(repoRootFromWebCwd(), "LiNKskills");
}

function parseYamlField(raw: string, key: string): string | null {
  const re = new RegExp(`^${key}:\\s*"?([^"\\n]+)"?\\s*$`, "m");
  const m = raw.match(re);
  return m?.[1]?.trim() ?? null;
}

function inferCapabilityStatus(raw: string, filename: string): RepoCapabilityCandidate["status"] {
  if (raw.includes("default_mode: live")) return "implemented";
  if (filename.includes("shadow") || raw.includes("mock")) return "declared";
  return "declared";
}

/** Scan LiNKskills/capability-connectors/cap.*.yaml for connectors not yet in the catalogue. */
export function discoverRepoCapabilities(alreadyRegisteredIds: Set<string>): RepoCapabilityCandidate[] {
  const dir = path.join(linkskillsRoot(), "capability-connectors");
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.startsWith("cap.") && f.endsWith(".yaml"));
  const out: RepoCapabilityCandidate[] = [];

  for (const filename of files) {
    const manifestPath = path.join(dir, filename);
    const raw = fs.readFileSync(manifestPath, "utf8");
    const pluginId = parseYamlField(raw, "plugin_id") ?? filename.replace(/\.yaml$/, "");
    if (alreadyRegisteredIds.has(pluginId)) continue;
    const name = parseYamlField(raw, "plugin_name") ?? pluginId;
    const version = parseYamlField(raw, "version") ?? "0.0.0";
    out.push({
      repoSlug: filename.replace(/\.yaml$/, ""),
      pluginId,
      name,
      version,
      manifestPath: path.relative(repoRootFromWebCwd(), manifestPath),
      status: inferCapabilityStatus(raw, filename),
    });
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** Scan LiNKskills/tools/definitions/*.json for repo-integrated tools not yet in the catalogue. */
export function discoverRepoTools(alreadyRegisteredNames: Set<string>): RepoToolCandidate[] {
  const dir = path.join(linkskillsRoot(), "tools", "definitions");
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const out: RepoToolCandidate[] = [];

  for (const filename of files) {
    const manifestPath = path.join(dir, filename);
    try {
      const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
        name?: string;
        tool_type?: string;
        category?: string;
        description?: string;
        implementation?: Record<string, unknown>;
      };
      const name = (parsed.name ?? filename.replace(/\.json$/, "")).trim().toLowerCase();
      if (!name || alreadyRegisteredNames.has(name)) continue;
      out.push({
        repoSlug: filename.replace(/\.json$/, ""),
        name,
        toolType: parsed.tool_type ?? "registry_reference",
        category: parsed.category ?? "Integration",
        description: parsed.description ?? `Repo tool from ${filename}`,
        manifestPath: path.relative(repoRootFromWebCwd(), manifestPath),
        implementation: parsed.implementation ?? { repo_manifest: manifestPath },
      });
    } catch {
      // skip invalid definition files
    }
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}
