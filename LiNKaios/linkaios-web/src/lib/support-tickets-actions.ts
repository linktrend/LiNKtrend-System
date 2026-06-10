"use server";

import { revalidatePath } from "next/cache";

import { assertCommandCentreWriter } from "@/lib/command-centre-writer-gate";
import { pushSupportTicketToChatwoot } from "@/lib/chatwoot-support-sync";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupportTicket, SupportTicketStatus } from "@/lib/support-tickets";
import {
  insertSupportTicketInDb,
  loadSupportTicketsFromDb,
  probeSupportTicketsTable,
  updateSupportTicketStatusInDb,
  type SupportTicketCreateInput,
} from "@/lib/support-tickets-data";

export type SupportTicketActionResult = {
  ok: boolean;
  ticket?: SupportTicket;
  tableReady: boolean;
  error?: string;
};

export async function probeSupportTicketsTableAction(): Promise<{ tableReady: boolean }> {
  const supabase = await createSupabaseServerClient();
  const tableReady = await probeSupportTicketsTable(supabase);
  return { tableReady };
}

export async function listSupportTicketsAction(opts?: {
  licenseeId?: string;
  openOnly?: boolean;
}): Promise<{ tickets: SupportTicket[]; tableReady: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const loaded = await loadSupportTicketsFromDb(supabase, opts);
  return {
    tickets: loaded.tickets,
    tableReady: loaded.tableReady,
    error: loaded.loadError ?? undefined,
  };
}

export async function createSupportTicketAction(
  input: SupportTicketCreateInput,
): Promise<SupportTicketActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { ok: false, tableReady: false, error: "Not signed in." };
  }

  const chatwootPush = await pushSupportTicketToChatwoot(input);
  const result = await insertSupportTicketInDb(supabase, {
    ...input,
    externalRef: chatwootPush.externalRef ?? undefined,
    source: input.source ?? (chatwootPush.externalRef ? "chatwoot_sync" : undefined),
  });
  if (!result.tableReady) {
    return { ok: false, tableReady: false, error: undefined };
  }
  if (result.error || !result.ticket) {
    return { ok: false, tableReady: true, error: result.error ?? "Could not create ticket." };
  }
  revalidatePath("/customer-service");
  revalidatePath("/work/alerts");
  revalidatePath("/settings/support");
  return { ok: true, ticket: result.ticket, tableReady: true };
}

export async function updateSupportTicketStatusAction(
  id: string,
  status: SupportTicketStatus,
): Promise<SupportTicketActionResult> {
  const gate = await assertCommandCentreWriter();
  if (!gate.ok) {
    return { ok: false, tableReady: true, error: gate.error };
  }

  const result = await updateSupportTicketStatusInDb(gate.supabase, id, status);
  if (!result.tableReady) {
    return { ok: false, tableReady: false, error: undefined };
  }
  if (result.error || !result.ticket) {
    return { ok: false, tableReady: true, error: result.error ?? "Could not update ticket." };
  }

  revalidatePath("/customer-service");
  revalidatePath("/work/alerts");
  revalidatePath("/licensees");
  return { ok: true, ticket: result.ticket, tableReady: true };
}
