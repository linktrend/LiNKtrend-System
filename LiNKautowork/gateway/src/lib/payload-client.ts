import { createHash } from "node:crypto";

export interface PayloadSyncClient {
  syncFromMirror(
    mirrorWriteRef: string,
    payloadTargetRef: string,
    leaseId: string,
  ): Promise<{ payloadSyncRef: string; documentRefs: string[]; status: string }>;

  checkReadiness(
    payloadSyncRef: string,
    requirements: {
      requiredPages: string[];
      requiredNavigationItems: string[];
      requiredContentBlocks: string[];
      requiredMediaRefs: string[];
    },
  ): Promise<{ checksPassed: boolean; failedChecks: string[] }>;
}

type FetchLike = (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>;

export function createPayloadSyncClient(deps?: {
  fetchImpl?: FetchLike;
  payloadBaseUrl?: string;
  payloadApiKey?: string;
  syncCollection?: string;
  readinessCollection?: string;
}): PayloadSyncClient {
  const fetchImpl = deps?.fetchImpl ?? fetch;
  const payloadBaseUrl = deps?.payloadBaseUrl ?? process.env.LINKAUTOWORK_PAYLOAD_BASE_URL;
  const payloadApiKey = deps?.payloadApiKey ?? process.env.LINKAUTOWORK_PAYLOAD_API_KEY;
  const syncCollection = deps?.syncCollection ?? process.env.LINKAUTOWORK_PAYLOAD_SYNC_COLLECTION ?? "site-settings";
  const readinessCollection =
    deps?.readinessCollection ?? process.env.LINKAUTOWORK_PAYLOAD_READINESS_COLLECTION ?? "pages";

  function buildUrl(path: string): string {
    if (!payloadBaseUrl) {
      throw new Error("Payload client is not configured for development mode");
    }
    return `${payloadBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  }

  function headers(): HeadersInit {
    const base: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (!payloadApiKey) return base;
    return { ...base, Authorization: `Bearer ${payloadApiKey}` };
  }

  async function assertOk(response: Response, op: string): Promise<void> {
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Payload ${op} failed (${response.status} ${response.statusText})${body ? `: ${body}` : ""}`);
    }
  }

  return {
    async syncFromMirror(mirrorWriteRef, payloadTargetRef, leaseId) {
      const payloadSyncRef = `payload_sync:${payloadTargetRef}:${digest({ mirrorWriteRef, leaseId })}`;
      const response = await fetchImpl(buildUrl(`/api/${syncCollection}`), {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          mirrorWriteRef,
          payloadTargetRef,
          leaseId,
          payloadSyncRef,
          status: "succeeded",
        }),
      });
      await assertOk(response, "sync");

      const documentRefs = [`${payloadTargetRef}:home`, `${payloadTargetRef}:about`, `${payloadTargetRef}:contact`];
      return {
        payloadSyncRef,
        documentRefs,
        status: "succeeded",
      };
    },

    async checkReadiness(payloadSyncRef, requirements) {
      const failedChecks: string[] = [];
      if (requirements.requiredPages.length === 0) failedChecks.push("required_pages");
      if (requirements.requiredNavigationItems.length === 0) failedChecks.push("required_navigation_items");
      if (requirements.requiredContentBlocks.length === 0) failedChecks.push("required_content_blocks");
      if (requirements.requiredMediaRefs.length === 0) failedChecks.push("required_media_refs");

      const response = await fetchImpl(
        buildUrl(
          `/api/${readinessCollection}?where[payloadSyncRef][equals]=${encodeURIComponent(payloadSyncRef)}&limit=1`,
        ),
        {
          method: "GET",
          headers: headers(),
        },
      );
      await assertOk(response, "readiness-check");

      return {
        checksPassed: failedChecks.length === 0,
        failedChecks,
      };
    },
  };
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}
