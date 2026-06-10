import { loadEnv, type Env } from "@linktrend/shared-config";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createChatwootConversation,
  listChatwootConversations,
  mapChatwootPriority,
  mapChatwootStatus,
  probeChatwootSupportReadiness,
  resolveChatwootSupportConfig,
  type ChatwootConversationRow,
} from "@/lib/chatwoot-support-client";
import { type SupportTicketCreateInput } from "@/lib/support-tickets-data";

const SUPPORT_TICKET_SELECT =
  "id, licensee_id, company_id, brand_id, subject, description, page_path, status, priority, source, requested_by, created_at, updated_at, external_ref, ai_attempt_summary";

function conversationSubject(row: ChatwootConversationRow): string {
  const fromAttr = row.custom_attributes?.subject;
  if (typeof fromAttr === "string" && fromAttr.trim()) return fromAttr.trim();
  const firstLine = row.messages?.[0]?.content?.split("\n")[0]?.trim();
  if (firstLine) return firstLine.slice(0, 160);
  return `Chatwoot conversation #${row.id}`;
}

function conversationDescription(row: ChatwootConversationRow): string {
  const content = row.messages?.[0]?.content?.trim();
  if (content) return content;
  return "Synced from Chatwoot.";
}

function conversationLicenseeId(row: ChatwootConversationRow): string {
  const fromAttr = row.custom_attributes?.licensee_id;
  if (typeof fromAttr === "string" && fromAttr.trim()) return fromAttr.trim();
  return "unknown-licensee";
}

function conversationPagePath(row: ChatwootConversationRow): string {
  const fromAttr = row.custom_attributes?.page_path;
  if (typeof fromAttr === "string" && fromAttr.trim()) return fromAttr.trim();
  return "/customer-service";
}

function conversationRequestedBy(row: ChatwootConversationRow): string {
  const senderName = row.meta?.sender?.name?.trim();
  if (senderName) return senderName;
  const senderEmail = row.meta?.sender?.email?.trim();
  if (senderEmail) return senderEmail;
  return "Chatwoot contact";
}

function conversationCreatedAt(row: ChatwootConversationRow): string {
  if (row.created_at) {
    return new Date(row.created_at * 1000).toISOString();
  }
  return new Date().toISOString();
}

export async function resolveChatwootSupportSyncState(
  env: Env = loadEnv(),
): Promise<{ ready: boolean; error: string | null }> {
  const config = resolveChatwootSupportConfig(env);
  if (!config) return { ready: false, error: null };

  const readiness = await probeChatwootSupportReadiness(config, env);
  if (!readiness.ok) {
    return { ready: false, error: readiness.error };
  }
  return { ready: true, error: null };
}

export async function syncChatwootConversationsToDb(
  supabase: SupabaseClient,
  env: Env = loadEnv(),
): Promise<{ synced: number; error: string | null }> {
  const config = resolveChatwootSupportConfig(env);
  if (!config) return { synced: 0, error: null };

  const readiness = await probeChatwootSupportReadiness(config, env);
  if (!readiness.ok) {
    return { synced: 0, error: readiness.error };
  }

  let conversations: ChatwootConversationRow[];
  try {
    conversations = await listChatwootConversations(config, env);
  } catch (error) {
    return {
      synced: 0,
      error: error instanceof Error ? error.message : "Chatwoot sync failed",
    };
  }

  let synced = 0;
  for (const row of conversations) {
    const externalRef = String(row.id);
    const now = new Date().toISOString();
    const payload = {
      licensee_id: conversationLicenseeId(row),
      company_id: null,
      brand_id: null,
      subject: conversationSubject(row),
      description: conversationDescription(row),
      page_path: conversationPagePath(row),
      status: mapChatwootStatus(row.status),
      priority: mapChatwootPriority(row.status),
      source: "chatwoot_sync" as const,
      requested_by: conversationRequestedBy(row),
      external_ref: externalRef,
      ai_attempt_summary: null,
      updated_at: now,
    };

    const { data: existing, error: existingError } = await supabase
      .schema("linkaios")
      .from("support_tickets")
      .select("id")
      .eq("external_ref", externalRef)
      .maybeSingle();

    if (existingError) {
      return { synced, error: existingError.message };
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .schema("linkaios")
        .from("support_tickets")
        .update(payload)
        .eq("id", existing.id);
      if (updateError) return { synced, error: updateError.message };
      synced += 1;
      continue;
    }

    const { error: insertError } = await supabase.schema("linkaios").from("support_tickets").insert({
      ...payload,
      created_at: conversationCreatedAt(row),
    });
    if (insertError) return { synced, error: insertError.message };
    synced += 1;
  }

  return { synced, error: null };
}

export async function pushSupportTicketToChatwoot(
  input: SupportTicketCreateInput,
  env: Env = loadEnv(),
): Promise<{ externalRef: string | null; error: string | null }> {
  const config = resolveChatwootSupportConfig(env);
  if (!config) return { externalRef: null, error: null };

  try {
    const created = await createChatwootConversation(
      config,
      {
        subject: input.subject,
        description: input.description,
        licenseeId: input.licenseeId,
        requestedBy: input.requestedBy?.trim() || "Licensee user",
        pagePath: input.pagePath,
        priority: input.priority,
      },
      env,
    );
    return { externalRef: created.conversationId, error: null };
  } catch (error) {
    return {
      externalRef: null,
      error: error instanceof Error ? error.message : "Chatwoot ticket push failed",
    };
  }
}
