/**
 * LinkSites publish phase helpers (LTS-105).
 */

export function buildTempPublishUrl(params: { business_slug: string }): string {
  const slug = params.business_slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return `https://${slug}.linktrend.media`;
}

export type PublishRecord = {
  run_id: string;
  tenant_id: string;
  temp_url: string;
  payload_sync_ref: string;
  preview_readiness_status: "ready" | "failed";
  published_at: string;
};

/**
 * Record publish outcome after payload sync and preview readiness gate.
 */
export function buildPublishRecord(params: {
  tenant_id: string;
  run_id: string;
  business_slug: string;
  payload_sync_ref: string;
  preview_readiness_status: "ready" | "failed";
}): PublishRecord {
  return {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    temp_url: buildTempPublishUrl({ business_slug: params.business_slug }),
    payload_sync_ref: params.payload_sync_ref,
    preview_readiness_status: params.preview_readiness_status,
    published_at: new Date().toISOString(),
  };
}
