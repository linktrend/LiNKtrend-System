import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type ArtifactBundleManifest = {
  tenant_id: string;
  run_id: string;
  site_id: string;
  site_generation_run_id: string;
  artifact_bundle_ref: string;
  artifact_digest: string;
  created_at: string;
  written_files: string[];
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function requireSafeArtifactRoot(input: string): { ok: true; rootPath: string } | { ok: false; reason: string } {
  if (input.trim().length === 0) {
    return { ok: false, reason: "artifact_root_path must be non-empty" };
  }
  if (!path.isAbsolute(input)) {
    return { ok: false, reason: "artifact_root_path must be an absolute path" };
  }
  const resolved = path.resolve(input);
  if (resolved.includes("\u0000")) {
    return { ok: false, reason: "artifact_root_path contains invalid characters" };
  }
  return { ok: true, rootPath: resolved };
}

function requireSafePathSegment(label: string, input: string): { ok: true } | { ok: false; reason: string } {
  if (input.trim().length === 0) {
    return { ok: false, reason: `${label} must be non-empty` };
  }
  if (input.includes("\u0000") || input.includes("/") || input.includes("\\") || input === "." || input === "..") {
    return { ok: false, reason: `${label} must be a safe path segment` };
  }
  return { ok: true };
}

function buildDeterministicPaths(rootPath: string, tenantId: string, runId: string, siteId: string, siteGenerationRunId: string) {
  const artifactDir = path.join(
    rootPath,
    "tenant",
    tenantId,
    "run",
    runId,
    "site",
    siteId,
    "generation",
    siteGenerationRunId,
  );
  return {
    artifactDir,
    bundlePath: path.join(artifactDir, "artifact-bundle-ref.txt"),
    manifestPath: path.join(artifactDir, "manifest.json"),
  };
}

export async function writeLinksitesArtifactBundle(params: {
  tenant_id: string;
  run_id: string;
  site_id: string;
  site_generation_run_id: string;
  artifact_bundle_ref: string;
  artifact_root_path: string;
  created_at?: string;
}): Promise<
  | {
      ok: true;
      artifact_ref: string;
      artifact_manifest_ref: string;
      artifact_root_path: string;
      written_files_count: number;
      artifact_digest: string;
      manifest: ArtifactBundleManifest;
    }
  | { ok: false; reason: string }
> {
  const safeRoot = requireSafeArtifactRoot(params.artifact_root_path);
  if (!safeRoot.ok) {
    return { ok: false, reason: safeRoot.reason };
  }
  for (const [label, value] of [
    ["tenant_id", params.tenant_id],
    ["run_id", params.run_id],
    ["site_id", params.site_id],
    ["site_generation_run_id", params.site_generation_run_id],
  ] as const) {
    const safeSegment = requireSafePathSegment(label, value);
    if (!safeSegment.ok) {
      return { ok: false, reason: safeSegment.reason };
    }
  }

  const paths = buildDeterministicPaths(
    safeRoot.rootPath,
    params.tenant_id,
    params.run_id,
    params.site_id,
    params.site_generation_run_id,
  );

  const relativeBundlePath = path.relative(safeRoot.rootPath, paths.bundlePath);
  const relativeManifestPath = path.relative(safeRoot.rootPath, paths.manifestPath);
  if (
    relativeBundlePath.startsWith("..") ||
    path.isAbsolute(relativeBundlePath) ||
    relativeManifestPath.startsWith("..") ||
    path.isAbsolute(relativeManifestPath)
  ) {
    return { ok: false, reason: "artifact_root_path failed path safety checks" };
  }

  const createdAt = params.created_at ?? new Date().toISOString();
  const artifactDigest = sha256(
    JSON.stringify({
      tenant_id: params.tenant_id,
      run_id: params.run_id,
      site_id: params.site_id,
      site_generation_run_id: params.site_generation_run_id,
      artifact_bundle_ref: params.artifact_bundle_ref,
    }),
  );

  const manifest: ArtifactBundleManifest = {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    site_id: params.site_id,
    site_generation_run_id: params.site_generation_run_id,
    artifact_bundle_ref: params.artifact_bundle_ref,
    artifact_digest: artifactDigest,
    created_at: createdAt,
    written_files: [relativeBundlePath, relativeManifestPath],
  };

  await mkdir(paths.artifactDir, { recursive: true });
  await writeFile(paths.bundlePath, `${params.artifact_bundle_ref}\n`, "utf8");
  await writeFile(paths.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return {
    ok: true,
    artifact_ref: relativeBundlePath,
    artifact_manifest_ref: relativeManifestPath,
    artifact_root_path: safeRoot.rootPath,
    written_files_count: manifest.written_files.length,
    artifact_digest: artifactDigest,
    manifest,
  };
}
