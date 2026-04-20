"use server";

import { createBrainOrgNode, updateBrainOrgNode } from "@linktrend/linklogic-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireWriter() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "You must be signed in." };
  const email = user.email ?? undefined;
  const role = await getCommandCentreRoleForUser(supabase, { userId: user.id, email });
  if (!canWriteCommandCentre(role)) {
    return { supabase, user: null, error: "Command-centre role is read-only for this action." };
  }
  return { supabase, user, error: null as string | null };
}

export async function createBrainOrgNodeFromForm(formData: FormData): Promise<void> {
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/company?err=${encodeURIComponent(error ?? "unauthorized")}`);
  }
  const dimension = String(formData.get("dimension") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const validFrom = String(formData.get("validFrom") ?? "").trim() || undefined;
  const validToRaw = String(formData.get("validTo") ?? "").trim();
  const validTo = validToRaw ? validToRaw : null;
  if (!dimension || !label) {
    redirect(`/company?err=${encodeURIComponent("dimension and label are required")}`);
  }
  const { error: cErr } = await createBrainOrgNode(supabase, {
    dimension,
    label,
    parentId,
    validFrom,
    validTo,
  });
  revalidatePath("/company");
  revalidatePath("/memory/company-structure");
  revalidatePath("/memory");
  if (cErr) {
    redirect(`/company?err=${encodeURIComponent(cErr.message)}`);
  }
  redirect("/company");
}

export async function updateBrainOrgNodeDatesFromForm(formData: FormData): Promise<void> {
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/company?err=${encodeURIComponent(error ?? "unauthorized")}`);
  }
  const id = String(formData.get("id") ?? "").trim();
  const validFrom = String(formData.get("validFrom") ?? "").trim();
  const validToRaw = String(formData.get("validTo") ?? "").trim();
  if (!id || !validFrom) {
    redirect(`/company?err=${encodeURIComponent("id and validFrom required")}`);
  }
  const { error: uErr } = await updateBrainOrgNode(supabase, id, {
    valid_from: validFrom,
    valid_to: validToRaw ? validToRaw : null,
  });
  revalidatePath("/company");
  revalidatePath("/memory/company-structure");
  revalidatePath("/memory");
  if (uErr) {
    redirect(`/company?err=${encodeURIComponent(uErr.message)}`);
  }
  redirect("/company");
}
