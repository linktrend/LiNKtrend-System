import { createHash } from "node:crypto";

export interface SupabaseMirrorClient {
  upsertSiteContent(
    tenantId: string,
    siteId: string,
    siteGenerationRunId: string,
    content: Record<string, unknown>,
    leaseId: string,
  ): Promise<{ mirrorWriteRef: string; revisionRef: string }>;

  upsertAssetRefs(
    tenantId: string,
    siteId: string,
    assets: Array<{ ref: string; kind: string }>,
    leaseId: string,
  ): Promise<{ upsertedCount: number }>;
}

type FetchLike = (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>;

export function createSupabaseMirrorClient(deps?: {
  fetchImpl?: FetchLike;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  schema?: string;
  contentTable?: string;
  assetTable?: string;
}): SupabaseMirrorClient {
  const fetchImpl = deps?.fetchImpl ?? fetch;
  const supabaseUrl = deps?.supabaseUrl ?? process.env.LINKAUTOWORK_SUPABASE_URL;
  const supabaseServiceRoleKey =
    deps?.supabaseServiceRoleKey ?? process.env.LINKAUTOWORK_SUPABASE_SERVICE_ROLE_KEY;
  const schema = deps?.schema ?? process.env.LINKAUTOWORK_SUPABASE_SCHEMA ?? "lsites_core";
  const contentTable = deps?.contentTable ?? process.env.LINKAUTOWORK_SUPABASE_CONTENT_TABLE ?? "sites";
  const assetTable = deps?.assetTable ?? process.env.LINKAUTOWORK_SUPABASE_ASSET_TABLE ?? "media";

  async function upsert(table: string, rows: Record<string, unknown>[]): Promise<void> {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Supabase client is not configured for development mode");
    }

    const response = await fetchImpl(
      `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}?on_conflict=tenant_id,site_id,site_generation_run_id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apikey: supabaseServiceRoleKey,
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
          Prefer: "resolution=merge-duplicates,return=minimal",
          "Accept-Profile": schema,
          "Content-Profile": schema,
        },
        body: JSON.stringify(rows),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Supabase mirror upsert failed (${response.status} ${response.statusText})${
          body ? `: ${body}` : ""
        }`,
      );
    }
  }

  return {
    async upsertSiteContent(tenantId, siteId, siteGenerationRunId, content, leaseId) {
      await upsert(contentTable, [
        {
          tenant_id: tenantId,
          site_id: siteId,
          site_generation_run_id: siteGenerationRunId,
          lease_id: leaseId,
          data: content,
          updated_at: new Date().toISOString(),
        },
      ]);

      const mirrorWriteRef = `supabase_mirror:${tenantId}:${siteId}:${siteGenerationRunId}`;
      const revisionRef = `${mirrorWriteRef}:${digest({ content, leaseId })}`;
      return { mirrorWriteRef, revisionRef };
    },

    async upsertAssetRefs(tenantId, siteId, assets, leaseId) {
      const records = assets.map((asset) => ({
        tenant_id: tenantId,
        site_id: siteId,
        site_generation_run_id: null,
        lease_id: leaseId,
        kind: asset.kind,
        ref: asset.ref,
        data: { ref: asset.ref, kind: asset.kind },
        updated_at: new Date().toISOString(),
      }));

      if (records.length > 0) {
        await upsert(assetTable, records);
      }

      return { upsertedCount: records.length };
    },
  };
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}
