"use server";

import { revalidatePath } from "next/cache";

import { assertCommandCentreWriter } from "@/lib/command-centre-writer-gate";
import { updateBrainLegalEntity } from "@linktrend/linklogic-sdk";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateLegalEntityFromForm(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  if (!UUID_RE.test(id) || !name) return;

  const gate = await assertCommandCentreWriter();
  if (!gate.ok) return;

  const { error } = await updateBrainLegalEntity(gate.supabase, id, { name, code: code || undefined });
  if (error) return;

  revalidatePath("/company");
}
