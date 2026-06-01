/**
 * LinkSites website build phase helpers (LTS-104).
 */

export type WebsiteBuildHandoff = {
  run_id: string;
  tenant_id: string;
  template_id: string;
  artifact_bundle_ref: string;
  website_package: Record<string, unknown>;
  handed_off_at: string;
};

/**
 * Package website_builder_bot output for LiNKautowork artifact_write_local.
 */
export function buildWebsiteHandoff(params: {
  tenant_id: string;
  run_id: string;
  template_id: string;
  website_package: Record<string, unknown>;
}): WebsiteBuildHandoff {
  return {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    template_id: params.template_id,
    website_package: params.website_package,
    artifact_bundle_ref: `bundle:${params.tenant_id}:${params.run_id}`,
    handed_off_at: new Date().toISOString(),
  };
}
