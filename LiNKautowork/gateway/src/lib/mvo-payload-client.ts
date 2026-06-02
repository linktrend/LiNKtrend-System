import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createPayloadSyncClient, type PayloadSyncClient } from "./payload-client.js";

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

type MvoLivePublishArtifact = {
  site_id: string;
  payload_sync_ref: string;
  preview_url: string;
};

function loadMvoLivePublishArtifact(): MvoLivePublishArtifact | null {
  const inline = process.env.MVO_LIVE_PUBLISH_JSON?.trim();
  let raw = inline;
  if (!raw) {
    const filePath = process.env.MVO_LIVE_PUBLISH_PATH?.trim();
    if (filePath && existsSync(filePath)) {
      raw = readFileSync(filePath, "utf8");
    }
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const siteId =
      typeof parsed.site_id === "string"
        ? parsed.site_id
        : typeof parsed.site_id === "number"
          ? String(parsed.site_id)
          : "";
    const previewUrl = typeof parsed.preview_url === "string" ? parsed.preview_url : "";
    const payloadSyncRef =
      typeof parsed.payload_sync_ref === "string"
        ? parsed.payload_sync_ref
        : siteId
          ? `payload_sync:${siteId}:mvo-live`
          : "";
    if (!siteId || !previewUrl || !payloadSyncRef) return null;
    return { site_id: siteId, payload_sync_ref: payloadSyncRef, preview_url: previewUrl };
  } catch {
    return null;
  }
}

/**
 * Payload sync/readiness when CMS content was already published via LiNKsites factory (Area 7).
 * Avoids duplicate HTTP sync from environments that cannot reach cms.linktrend.internal.
 */
export function createMvoLiveFactoryPayloadSyncClient(
  live: MvoLivePublishArtifact,
): PayloadSyncClient {
  const target = live.site_id;
  return {
    async syncFromMirror(_mirrorWriteRef, payloadTargetRef, _leaseId) {
      const payloadSyncRef = live.payload_sync_ref;
      return {
        payloadSyncRef,
        documentRefs: [
          `${payloadTargetRef || target}:home`,
          `${payloadTargetRef || target}:about`,
          `${payloadTargetRef || target}:contact`,
          `${payloadTargetRef || target}:services`,
        ],
        status: "succeeded",
      };
    },

    async checkReadiness(payloadSyncRef, requirements) {
      if (payloadSyncRef !== live.payload_sync_ref) {
        return { checksPassed: false, failedChecks: ["payload_sync_ref_mismatch"] };
      }
      const failedChecks: string[] = [];
      for (const page of requirements.requiredPages) {
        if (!["home", "about", "contact", "services"].includes(page)) {
          failedChecks.push(`page_not_in_live_factory:${page}`);
        }
      }
      return { checksPassed: failedChecks.length === 0, failedChecks };
    },
  };
}

export function isMvoLiveFactoryPublishMode(): boolean {
  return process.env.MVO_LIVE_RUN === "1" && loadMvoLivePublishArtifact() != null;
}

/**
 * MVO mock/shadow Payload client: deterministic sync + readiness without live Payload HTTP.
 * CONTRACTS_MVO.md §11 — mock modes still require lease + audit via workflow handlers.
 */
export function createMvoMockPayloadSyncClient(): PayloadSyncClient {
  return {
    async syncFromMirror(mirrorWriteRef, payloadTargetRef, leaseId) {
      const payloadSyncRef = `payload_sync:${payloadTargetRef}:${digest({ mirrorWriteRef, leaseId })}`;
      return {
        payloadSyncRef,
        documentRefs: [
          `${payloadTargetRef}:home`,
          `${payloadTargetRef}:about`,
          `${payloadTargetRef}:contact`,
        ],
        status: "succeeded",
      };
    },

    async checkReadiness(payloadSyncRef, requirements) {
      const failedChecks: string[] = [];

      if (!payloadSyncRef.startsWith("payload_sync:")) {
        failedChecks.push("invalid_payload_sync_ref");
      }

      for (const page of requirements.requiredPages) {
        if (typeof page !== "string" || page.trim().length === 0) {
          failedChecks.push(`missing_page:${page}`);
        }
      }

      if (requirements.requiredPages.length === 0) {
        failedChecks.push("no_required_pages");
      }

      const checksPassed = failedChecks.length === 0;
      return { checksPassed, failedChecks };
    },
  };
}

export function isMvoPayloadMockMode(): boolean {
  const mode = process.env.LINKAUTOWORK_MVO_MODE?.trim().toLowerCase();
  return mode === "mock" || mode === "shadow";
}

export function resolvePayloadSyncClient(deps?: {
  payloadClient?: PayloadSyncClient;
}): PayloadSyncClient {
  if (deps?.payloadClient) {
    return deps.payloadClient;
  }
  const liveFactory = loadMvoLivePublishArtifact();
  if (isMvoLiveFactoryPublishMode() && liveFactory) {
    return createMvoLiveFactoryPayloadSyncClient(liveFactory);
  }
  if (isMvoPayloadMockMode()) {
    return createMvoMockPayloadSyncClient();
  }
  return createPayloadSyncClient();
}
