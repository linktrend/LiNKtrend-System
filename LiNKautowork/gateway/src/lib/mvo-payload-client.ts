import { createHash } from "node:crypto";
import { createPayloadSyncClient, type PayloadSyncClient } from "./payload-client.js";

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
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
  if (isMvoPayloadMockMode()) {
    return createMvoMockPayloadSyncClient();
  }
  return createPayloadSyncClient();
}
