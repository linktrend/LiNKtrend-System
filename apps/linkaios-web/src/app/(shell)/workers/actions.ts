"use server";

import { revalidatePath } from "next/cache";

import { assertCommandCentreWriter } from "@/lib/command-centre-writer-gate";

export type CreateAgentResult = { ok: true; id: string } | { ok: false; error: string };

/** Escape `%`, `_`, and `\` for a literal match inside PostgREST `ilike`. */
function escapeIlikeLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function createAgentAction(formData: FormData): Promise<CreateAgentResult> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const status = String(formData.get("status") ?? "inactive").trim();
  if (!displayName) return { ok: false, error: "Name is required." };
  if (!["active", "inactive", "retired"].includes(status)) return { ok: false, error: "Invalid status." };

  const gate = await assertCommandCentreWriter();
  if (!gate.ok) return { ok: false, error: gate.error };

  const pattern = escapeIlikeLiteral(displayName);
  const { data: taken, error: dupErr } = await gate.supabase
    .schema("linkaios")
    .from("agents")
    .select("id")
    .ilike("display_name", pattern)
    .maybeSingle();

  if (dupErr) return { ok: false, error: dupErr.message };
  if (taken?.id) return { ok: false, error: "A LiNKbot with this display name already exists." };

  const { data, error } = await gate.supabase
    .schema("linkaios")
    .from("agents")
    .insert({ display_name: displayName, status })
    .select("id")
    .single();
  if (error || !data?.id) return { ok: false, error: error?.message ?? "Insert failed." };

  revalidatePath("/workers");
  revalidatePath("/", "layout");
  return { ok: true, id: String(data.id) };
}
