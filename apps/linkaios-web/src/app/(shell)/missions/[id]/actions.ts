"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const MISSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AppendMissionMemoryState = { ok: boolean; error?: string } | null;

export async function appendMissionMemory(
  _prev: AppendMissionMemoryState,
  formData: FormData,
): Promise<AppendMissionMemoryState> {
  const missionId = String(formData.get("mission_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!MISSION_ID_RE.test(missionId)) {
    return { ok: false, error: "Invalid mission id." };
  }
  if (!body) {
    return { ok: false, error: "Memory body is required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.schema("linkaios").from("memory_entries").insert({
    mission_id: missionId,
    classification: "working",
    body,
    metadata: {},
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/missions/${missionId}`);
  return { ok: true };
}
