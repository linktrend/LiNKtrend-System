import type { Env } from "@linktrend/shared-config";

import type { SupportTicketPriority, SupportTicketStatus } from "@/lib/support-tickets";

export type ChatwootSupportConfig = {
  baseUrl: string;
  accountId: string;
  apiToken: string;
  inboxId: string;
};

export type ChatwootConversationRow = {
  id: number;
  status: string;
  created_at: number;
  custom_attributes?: Record<string, unknown>;
  meta?: {
    sender?: {
      name?: string;
      email?: string;
    };
  };
  messages?: Array<{
    content?: string;
    created_at?: number;
  }>;
};

const CHATWOOT_REQUEST_TIMEOUT_MS = 15_000;

export function isChatwootSupportSyncConfigured(env: Env): boolean {
  if (env.CHATWOOT_SUPPORT_SYNC_MODE !== "live") return false;
  return Boolean(
    env.CHATWOOT_BASE_URL &&
      env.CHATWOOT_ACCOUNT_ID &&
      env.CHATWOOT_API_ACCESS_TOKEN &&
      env.CHATWOOT_INBOX_ID,
  );
}

export function resolveChatwootSupportConfig(env: Env): ChatwootSupportConfig | null {
  if (!isChatwootSupportSyncConfigured(env)) return null;

  const baseUrl = env.CHATWOOT_BASE_URL?.replace(/\/+$/, "");
  const accountId = env.CHATWOOT_ACCOUNT_ID?.trim();
  const apiToken = env.CHATWOOT_API_ACCESS_TOKEN?.trim();
  const inboxId = env.CHATWOOT_INBOX_ID?.trim();

  if (!baseUrl || !accountId || !apiToken || !inboxId) return null;

  return { baseUrl, accountId, apiToken, inboxId };
}

export function mapChatwootStatus(status: string): SupportTicketStatus {
  const normalized = status.trim().toLowerCase();
  if (normalized === "resolved") return "resolved";
  if (normalized === "pending" || normalized === "snoozed") return "in_progress";
  return "open";
}

export function mapChatwootPriority(_status: string): SupportTicketPriority {
  return "normal";
}

export async function probeChatwootSupportReadiness(
  config: ChatwootSupportConfig,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await chatwootRequest(config, "GET", `/api/v1/accounts/${config.accountId}`);
    if (!response.ok) {
      return { ok: false, error: `Chatwoot readiness failed (${response.status})` };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Chatwoot readiness check failed",
    };
  }
}

export async function listChatwootConversations(
  config: ChatwootSupportConfig,
): Promise<ChatwootConversationRow[]> {
  const params = new URLSearchParams({
    inbox_id: config.inboxId,
    status: "all",
    page: "1",
  });
  const response = await chatwootRequest(
    config,
    "GET",
    `/api/v1/accounts/${config.accountId}/conversations?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Chatwoot conversation list failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    data?: { payload?: ChatwootConversationRow[] };
    payload?: ChatwootConversationRow[];
  };

  if (Array.isArray(payload.payload)) return payload.payload;
  if (Array.isArray(payload.data?.payload)) return payload.data.payload;
  return [];
}

export async function createChatwootConversation(
  config: ChatwootSupportConfig,
  input: {
    subject: string;
    description: string;
    licenseeId: string;
    requestedBy: string;
    pagePath: string;
    priority?: SupportTicketPriority;
  },
): Promise<{ conversationId: string }> {
  const contactEmail = `support+${input.licenseeId}@linktrend.internal`;
  const contactResponse = await chatwootRequest(
    config,
    "POST",
    `/api/v1/accounts/${config.accountId}/contacts`,
    {
      inbox_id: Number(config.inboxId),
      name: input.requestedBy,
      email: contactEmail,
    },
  );

  let contactId: number | undefined;
  if (contactResponse.ok) {
    const contactPayload = (await contactResponse.json()) as {
      payload?: { contact?: { id?: number } };
      id?: number;
    };
    contactId = contactPayload.payload?.contact?.id ?? contactPayload.id;
  }

  const sourceId = `${input.licenseeId}:${Date.now()}`;
  const body: Record<string, unknown> = {
    inbox_id: Number(config.inboxId),
    source_id: sourceId,
    status: "open",
    message: {
      content: `${input.subject}\n\n${input.description}\n\nPage: ${input.pagePath}`,
    },
    custom_attributes: {
      licensee_id: input.licenseeId,
      page_path: input.pagePath,
      priority: input.priority ?? "normal",
      subject: input.subject,
    },
  };
  if (contactId) body.contact_id = contactId;

  const response = await chatwootRequest(
    config,
    "POST",
    `/api/v1/accounts/${config.accountId}/conversations`,
    body,
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Chatwoot conversation create failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const created = (await response.json()) as { id?: number };
  if (!created.id) {
    throw new Error("Chatwoot conversation create returned no id");
  }

  return { conversationId: String(created.id) };
}

async function chatwootRequest(
  config: ChatwootSupportConfig,
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: Record<string, unknown>,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHATWOOT_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: {
        api_access_token: config.apiToken,
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
