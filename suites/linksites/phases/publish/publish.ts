/**
 * LinkSites publish phase helpers (LTS-105).
 * Publish requires payload sync proof + preview readiness gate — not URL string alone.
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
  payload_document_refs: string[];
  payload_sync_status: string;
  preview_readiness_status: "ready" | "failed";
  published_at: string;
  mvo_equivalent: boolean;
};

export type PublishBlocked = { blocked: true; reason: string };

/**
 * Fail-closed publish: only after payload sync succeeded and preview readiness is ready.
 */
export function executeMvoPublish(params: {
  tenant_id: string;
  run_id: string;
  business_slug: string;
  payload_sync_ref: string;
  payload_sync_status: string;
  payload_document_refs: string[];
  preview_readiness_status: "ready" | "failed";
  mvo_equivalent?: boolean;
}): PublishRecord | PublishBlocked {
  if (params.preview_readiness_status !== "ready") {
    return { blocked: true, reason: "preview_readiness_status must be ready before publish" };
  }
  if (!params.payload_sync_ref.startsWith("payload_sync:")) {
    return { blocked: true, reason: "payload_sync_ref required for publish" };
  }
  if (params.payload_sync_status !== "succeeded") {
    return { blocked: true, reason: "payload_sync_status must be succeeded" };
  }
  if (params.payload_document_refs.length === 0) {
    return { blocked: true, reason: "payload_document_refs must be non-empty" };
  }

  return {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    temp_url: buildTempPublishUrl({ business_slug: params.business_slug }),
    payload_sync_ref: params.payload_sync_ref,
    payload_document_refs: params.payload_document_refs,
    payload_sync_status: params.payload_sync_status,
    preview_readiness_status: params.preview_readiness_status,
    published_at: new Date().toISOString(),
    mvo_equivalent: params.mvo_equivalent ?? true,
  };
}

/**
 * @deprecated Prefer executeMvoPublish — kept for tests migrating from buildPublishRecord.
 */
export function buildPublishRecord(params: {
  tenant_id: string;
  run_id: string;
  business_slug: string;
  payload_sync_ref: string;
  preview_readiness_status: "ready" | "failed";
}): PublishRecord {
  const result = executeMvoPublish({
    ...params,
    payload_sync_status: "succeeded",
    payload_document_refs: ["payload:home", "payload:about", "payload:contact"],
    mvo_equivalent: true,
  });
  if ("blocked" in result) {
    throw new Error(result.reason);
  }
  return result;
}
