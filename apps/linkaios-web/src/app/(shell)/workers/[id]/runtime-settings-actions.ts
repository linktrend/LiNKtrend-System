"use server";

import { revalidatePath } from "next/cache";

import { assertCommandCentreWriter } from "@/lib/command-centre-writer-gate";
import {
  mergeRuntimeSettings,
  modelEntryById,
  parseRuntimeSettings,
  serialiseRuntimeSettings,
  type AgentRuntimeSettings,
  type ModelCategoryId,
} from "@/lib/agent-runtime-settings";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type RuntimeSettingsActionResult = { ok: true } | { ok: false; error: string };

function validateSettings(s: AgentRuntimeSettings): string | null {
  const fo = s.models.fallbackOnline;
  if (fo) {
    const e = modelEntryById(fo);
    if (!e || e.kind !== "cloud") return "Fallback online model must be a cloud (API) model.";
  }
  const fl = s.models.fallbackLocal;
  if (fl) {
    const e = modelEntryById(fl);
    if (!e || e.kind !== "local") return "Local fallback must be a local model.";
  }
  const { tokenAlertThreshold: alert, tokenHardCap: cap } = s.cloudSpend;
  if (alert != null && cap != null && cap < alert) {
    return "Cloud token hard cap must be greater than or equal to the alert threshold.";
  }
  return null;
}

export async function saveAgentRuntimeSettingsAction(
  agentId: string,
  raw: unknown,
): Promise<RuntimeSettingsActionResult> {
  if (!UUID_RE.test(agentId)) return { ok: false, error: "Invalid agent id." };
  const next = parseRuntimeSettings(raw);
  const err = validateSettings(next);
  if (err) return { ok: false, error: err };
  const gate = await assertCommandCentreWriter();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("agents")
    .update({
      runtime_settings: serialiseRuntimeSettings(next),
      updated_at: new Date().toISOString(),
    })
    .eq("id", agentId);
  if (upErr) return { ok: false, error: upErr.message };

  revalidatePath(`/workers/${agentId}`, "layout");
  revalidatePath(`/workers/${agentId}/settings`);
  revalidatePath(`/workers/${agentId}/models`);
  return { ok: true };
}

export async function saveAgentPrimaryModelsAction(
  agentId: string,
  primary: Record<ModelCategoryId, string>,
): Promise<RuntimeSettingsActionResult> {
  if (!UUID_RE.test(agentId)) return { ok: false, error: "Invalid agent id." };
  const gate = await assertCommandCentreWriter();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { data, error: selErr } = await gate.supabase.schema("linkaios").from("agents").select("*").eq("id", agentId).maybeSingle();
  if (selErr) return { ok: false, error: selErr.message };
  if (!data) return { ok: false, error: "Agent not found." };

  const current = parseRuntimeSettings((data as { runtime_settings?: unknown }).runtime_settings);
  const merged = parseRuntimeSettings(
    serialiseRuntimeSettings(mergeRuntimeSettings(current, { models: { primary } })),
  );
  const v = validateSettings(merged);
  if (v) return { ok: false, error: v };

  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("agents")
    .update({
      runtime_settings: serialiseRuntimeSettings(merged),
      updated_at: new Date().toISOString(),
    })
    .eq("id", agentId);
  if (upErr) return { ok: false, error: upErr.message };

  revalidatePath(`/workers/${agentId}`, "layout");
  revalidatePath(`/workers/${agentId}/models`);
  return { ok: true };
}
