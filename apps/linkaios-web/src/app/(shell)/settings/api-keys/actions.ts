"use server";

import { isCommandCentreAdmin } from "@/lib/command-centre-access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type IntegrationSecretRow = {
  id: string;
  slug: string;
  label: string;
  provider: string;
  created_at: string;
  updated_at: string;
};

export async function listIntegrationSecretsAction(): Promise<
  { ok: true; rows: IntegrationSecretRow[] } | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Not signed in" };

  const admin = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });
  if (!admin) return { ok: false, error: "Admin only" };

  const adminClient = getSupabaseAdmin();
  const { data, error } = await adminClient
    .schema("linkaios")
    .from("integration_secrets")
    .select("id, slug, label, provider, created_at, updated_at")
    .order("label", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, rows: (data ?? []) as IntegrationSecretRow[] };
}

export async function upsertIntegrationSecretAction(input: {
  slug: string;
  label: string;
  provider: string;
  secretValue: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const slug = input.slug.trim().toUpperCase().replace(/\s+/g, "_");
  if (!/^[A-Z0-9_]{2,120}$/.test(slug)) {
    return { ok: false, error: "Slug must be 2–120 uppercase letters, digits, or underscores." };
  }
  if (!input.label.trim()) return { ok: false, error: "Label is required" };
  if (!input.secretValue.trim()) return { ok: false, error: "Secret value is required" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Not signed in" };

  const admin = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });
  if (!admin) return { ok: false, error: "Admin only" };

  const prov = (input.provider.trim() || "other").toLowerCase();
  const allowedProv = new Set(["openai", "anthropic", "google", "zulip", "gateway", "other"]);
  if (!allowedProv.has(prov)) return { ok: false, error: "Invalid provider" };

  const adminClient = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await adminClient.schema("linkaios").from("integration_secrets").upsert(
    {
      slug,
      label: input.label.trim(),
      provider: prov,
      secret_value: input.secretValue.trim(),
      updated_at: now,
    },
    { onConflict: "slug" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteIntegrationSecretAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) return { ok: false, error: "Missing id" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, error: "Not signed in" };

  const admin = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });
  if (!admin) return { ok: false, error: "Admin only" };

  const adminClient = getSupabaseAdmin();
  const { error } = await adminClient.schema("linkaios").from("integration_secrets").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
