/**
 * DB-backed suite marketplace catalogue (Wave 6.4).
 * Reads published plugins from linkaios_kernel.plugins.
 */

import type { SupabaseClient } from "@linktrend/db";

export type MarketplaceCatalogueItem = {
  id: string;
  name: string;
  summary: string;
  published: boolean;
  version: string;
  suiteFamily: string | null;
  source: "linksuitegen" | "kernel" | "builtin";
  priceMonthlyUsd: number | null;
  stripeMode: "shadow" | "live" | null;
};

type ManifestMarketplace = {
  marketplace?: {
    source?: string;
    suite_family?: string;
    marketplace_listed?: boolean;
    publish_state?: string;
    stripe_mode?: string;
    price_monthly_usd?: number;
    client_visible?: boolean;
  };
};

/** @internal Exported for unit tests (Wave 6.4). */
export function parseMarketplaceMeta(
  pluginId: string,
  manifest: ManifestMarketplace,
  purpose: string,
  pluginName: string,
  status: string,
): MarketplaceCatalogueItem | null {
  const m = manifest.marketplace;
  const listed =
    m?.marketplace_listed ?? (pluginId === "websitefactory" || pluginId === "linksites");
  const clientVisible = m?.client_visible ?? true;
  if (!listed || !clientVisible) return null;

  const publishState = m?.publish_state ?? (status === "active" ? "published" : "draft");

  return {
    id: pluginId,
    name: pluginName,
    summary: purpose,
    published: publishState === "published",
    version: "",
    suiteFamily: m?.suite_family ?? null,
    source:
      m?.source === "linksuitegen" ? "linksuitegen" : pluginId === "websitefactory" ? "builtin" : "kernel",
    priceMonthlyUsd: typeof m?.price_monthly_usd === "number" ? m.price_monthly_usd : null,
    stripeMode: m?.stripe_mode === "live" ? "live" : m?.stripe_mode === "shadow" ? "shadow" : null,
  };
}

/** Load marketplace-visible suites from plugins table. */
export async function loadMarketplaceCatalogue(
  supabase: SupabaseClient,
): Promise<MarketplaceCatalogueItem[]> {
  const { data, error } = await supabase
    .schema("linkaios_kernel")
    .from("plugins")
    .select("plugin_id, plugin_name, purpose, version, status, manifest_json")
    .eq("status", "active")
    .order("plugin_name");

  if (error) {
    throw new Error(`marketplace catalogue load failed: ${error.message}`);
  }

  const items: MarketplaceCatalogueItem[] = [];
  for (const row of data ?? []) {
    const pluginId = String((row as { plugin_id: string }).plugin_id);
    const manifest = ((row as { manifest_json?: ManifestMarketplace }).manifest_json ??
      {}) as ManifestMarketplace;
    const parsed = parseMarketplaceMeta(
      pluginId,
      manifest,
      String((row as { purpose: string }).purpose),
      String((row as { plugin_name: string }).plugin_name),
      String((row as { status: string }).status),
    );
    if (parsed) {
      parsed.version = String((row as { version: string }).version);
      items.push(parsed);
    }
  }

  return items;
}

/** Tenant entitlements from tenant_suite_entitlements. */
export async function loadTenantEntitlements(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<Record<string, { moduleIds: string[]; enabled: boolean }>> {
  const { data, error } = await supabase
    .schema("linkaios_kernel")
    .from("tenant_suite_entitlements")
    .select("suite_id, module_ids, enabled")
    .eq("tenant_id", tenantId);

  if (error) {
    throw new Error(`tenant entitlements load failed: ${error.message}`);
  }

  const out: Record<string, { moduleIds: string[]; enabled: boolean }> = {};
  for (const row of data ?? []) {
    const suiteId = String((row as { suite_id: string }).suite_id);
    out[suiteId] = {
      moduleIds: ((row as { module_ids?: string[] }).module_ids ?? []) as string[],
      enabled: Boolean((row as { enabled: boolean }).enabled),
    };
  }
  return out;
}
