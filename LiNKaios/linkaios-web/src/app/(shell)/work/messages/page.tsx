import { resolveLicensorTenantId } from "@/lib/admin-linkskills-tenant";
import { readAppSurfaceFromHeaders } from "@/lib/app-surface";
import { parseLicensorScopeParam } from "@/lib/licensor-view-scope";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  enrichChannelThreadsWithTenantKey,
  filterChannelThreadsForViewScope,
  groupZulipIntoThreads,
  prepareChannelThreads,
} from "@/lib/work-messages";
import { isZulipMessagingConfigured, resolveWorkMessagingChannelConfig } from "@/lib/work-channel-config";
import { getZulipSiteUrlFromEnv } from "@/lib/zulip-links";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { WorkMessagesWorkspace } from "../work-messages-workspace";

export const dynamic = "force-dynamic";

export default async function WorkMessagesPage(props: {
  searchParams: Promise<{ scope?: string | string[]; thread?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createSupabaseServerClient();
  const surface = await readAppSurfaceFromHeaders();
  const viewScope = parseLicensorScopeParam(searchParams.scope);
  const channelConfig = resolveWorkMessagingChannelConfig();
  const zulipConfigured = isZulipMessagingConfigured();

  const [zulipRes, agentsRes, missionsRes] = await Promise.all([
    supabase
      .schema("gateway")
      .from("zulip_message_links")
      .select("id, zulip_message_id, stream_id, topic, mission_id, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.schema("linkaios").from("agents").select("id, display_name").order("display_name", { ascending: true }),
    supabase.schema("linkaios").from("projects").select("id, primary_agent_id, tenant_id"),
  ]);

  const { data: rows, error } = zulipRes;
  const zulipSiteUrl = getZulipSiteUrlFromEnv();
  const fromDb = !error && rows?.length ? groupZulipIntoThreads(rows, { zulipSiteUrl }) : [];
  const missionTenantById: Record<string, string | null> = {};
  for (const m of missionsRes.data ?? []) {
    const row = m as { id: string; tenant_id?: string | null };
    missionTenantById[String(row.id)] = row.tenant_id ? String(row.tenant_id) : null;
  }
  const licensorTenantId = surface === "admin" ? await resolveLicensorTenantId() : null;
  let merged = prepareChannelThreads(
    [...fromDb].sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()),
    { zulipSiteUrl },
  );
  merged = enrichChannelThreadsWithTenantKey(merged, missionTenantById, licensorTenantId);
  if (surface === "admin") {
    merged = filterChannelThreadsForViewScope(viewScope, merged, licensorTenantId);
  }

  const agents =
    (agentsRes.data ?? []).map((a) => ({
      id: String((a as { id: string }).id),
      display_name: String((a as { display_name: string }).display_name ?? "LiNKbot"),
    })) ?? [];

  const missionPrimaryAgent: Record<string, string | null> = {};
  if (!missionsRes.error) {
    for (const m of missionsRes.data ?? []) {
      const row = m as { id: string; primary_agent_id: string | null };
      missionPrimaryAgent[String(row.id)] = row.primary_agent_id ? String(row.primary_agent_id) : null;
    }
  }

  return (
    <main>
      <ShellPageHeaderClient
        title="Messages"
        subtitle="Zulip project streams, newest first. Open in Zulip to reply in your workspace."
      />
      <div className="mt-8">
        {error ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100" role="status">
            Channel data could not be loaded. Check gateway connectivity and refresh.
          </p>
        ) : null}
        {!zulipConfigured ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100" role="status">
            Zulip URL is not configured. Set <code className="text-xs">ZULIP_SITE_URL</code> in the deployment environment so Open in Zulip links work.
          </p>
        ) : null}
        <WorkMessagesWorkspace
          threads={merged}
          agents={agents}
          missionPrimaryAgent={missionPrimaryAgent}
          channelConfig={channelConfig}
          zulipConfigured={zulipConfigured}
        />
      </div>
    </main>
  );
}
