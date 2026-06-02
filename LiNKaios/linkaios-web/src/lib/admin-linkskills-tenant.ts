import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Resolve the Calusa licensee tenant for LiNKtrend Admin governance surfaces.
 */
export async function resolveCalusaTenantId(): Promise<string> {
  const fromEnv =
    process.env.CALUSA_TENANT_ID?.trim() ||
    process.env.MVO_E2E_TENANT_ID?.trim();
  if (fromEnv) return fromEnv;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.schema("linkaios_kernel").rpc("seed_demo_tenant", {
    p_slug: "calusa",
    p_display_name: "Calusa Tenant",
  });
  if (error || !data?.length) {
    throw new Error(`Failed to resolve Calusa tenant: ${error?.message ?? "empty result"}`);
  }
  const row = data[0] as { tenant_id?: string };
  if (!row.tenant_id) {
    throw new Error("seed_demo_tenant returned no tenant_id for Calusa");
  }
  return row.tenant_id;
}
