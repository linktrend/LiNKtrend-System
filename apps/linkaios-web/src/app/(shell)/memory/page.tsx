import Link from "next/link";

import { LinkbrainTabNav } from "@/components/linkbrain/linkbrain-tab-nav";
import { MemoryCommandCentre } from "@/components/linkbrain/memory-command-centre";
import type { LinkbrainTab } from "@/lib/linkbrain-data";
import { loadLinkbrainPageData } from "@/lib/linkbrain-data";
import { BUTTON } from "@/lib/ui-standards";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { applyLinkbrainUiMockOverlay } from "@/lib/ui-mocks/linkbrain-demo-overlay";
import { runBrainRetrievalSandbox } from "@/lib/brain-sandbox";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { BrainInboxItemType, BrainRetrieveContextResult, BrainScope } from "@linktrend/linklogic-sdk";

export const dynamic = "force-dynamic";

const ORDERED_TABS: readonly LinkbrainTab[] = ["inbox", "project", "agent", "company", "ask"];

function parseTab(v: string | undefined): LinkbrainTab {
  if (v === "missions") return "project";
  if (v === "sandbox") return "ask";
  if (v === "virtual") return "project";
  if (v === "overview" || v === "library") return "inbox";
  if (v && (ORDERED_TABS as readonly string[]).includes(v)) return v as LinkbrainTab;
  return "inbox";
}

function parseScope(v: string | undefined): "recent" | "all" {
  return v === "all" ? "all" : "recent";
}

function parseBrainScope(v: string | undefined): BrainScope {
  if (v === "mission" || v === "agent") return v;
  return "company";
}

const INBOX_TYPES: BrainInboxItemType[] = ["upload", "quick_note", "librarian", "edit_proposal", "standard"];

function parseInboxItem(v: string | undefined): BrainInboxItemType | null {
  if (v && INBOX_TYPES.includes(v as BrainInboxItemType)) return v as BrainInboxItemType;
  return null;
}

export default async function MemoryPage(props: {
  searchParams: Promise<{
    tab?: string;
    mission?: string;
    classification?: string;
    agent?: string;
    scope?: string;
    b_scope?: string;
    b_mission?: string;
    b_agent?: string;
    b_path?: string;
    b_query?: string;
    b_file?: string;
    b_kind?: string;
    inbox_item?: string;
    inbox_sort?: string;
    org?: string;
    err?: string;
  }>;
}) {
  const sp = await props.searchParams;
  const tab = parseTab(sp.tab);
  const missionFilter = sp.mission?.trim();
  const classificationFilter = sp.classification?.trim();
  const agentFilter = sp.agent?.trim();
  const scope = parseScope(sp.scope);
  const brainScope = parseBrainScope(sp.b_scope);
  const orgNodeId = sp.org?.trim();
  const brainMissionId =
    sp.b_mission?.trim() ?? (tab === "project" && missionFilter ? missionFilter : undefined);
  const brainAgentId = sp.b_agent?.trim() ?? (tab === "agent" && agentFilter ? agentFilter : undefined);
  let sandboxPath = sp.b_path?.trim();
  const sandboxQuery = sp.b_query?.trim();
  const inboxItemType = parseInboxItem(sp.inbox_item?.trim());
  const inboxSort = sp.inbox_sort === "asc" ? "asc" : "desc";
  const brainFileKindFilter = sp.b_kind?.trim() || null;
  const askSelectedFileId = sp.b_file?.trim() || undefined;

  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();
  let data = await loadLinkbrainPageData(supabase, {
    tab,
    missionId: missionFilter,
    classification: classificationFilter,
    agentId: agentFilter,
    scope,
    brainScope,
    brainMissionId,
    brainAgentId,
    orgNodeId,
    inboxItemType,
    inboxSort,
    brainFileKindFilter,
  });

  if (uiMocksEnabled && !data.error) {
    data = applyLinkbrainUiMockOverlay(data);
  }

  if (tab === "ask" && !sandboxPath && askSelectedFileId) {
    const hit = data.brainPartitionFiles.find((f) => f.id === askSelectedFileId);
    if (hit) sandboxPath = hit.logical_path;
  }

  let brainSandbox: BrainRetrieveContextResult | null = null;
  if (tab === "ask" && sandboxPath && sandboxQuery) {
    brainSandbox = await runBrainRetrievalSandbox(supabase, {
      scope: brainScope,
      logicalPath: sandboxPath,
      query: sandboxQuery,
      missionId: brainMissionId,
      agentId: brainAgentId,
    });
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">LiNKbrain</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Your company knowledge hub: review drafts in <strong>Inbox</strong>, browse by project or LiNKbot, and ask
            read-only questions when you need a quick excerpt.
          </p>
        </div>
        <Link href="/memory/drafts/new" className={`${BUTTON.primaryRow} h-fit shrink-0`}>
          Add Knowledge
        </Link>
      </div>

      {sp.err ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {(() => {
            try {
              return decodeURIComponent(sp.err);
            } catch {
              return sp.err;
            }
          })()}
        </p>
      ) : null}

      <LinkbrainTabNav
        active={tab}
        mission={missionFilter}
        classification={classificationFilter}
        agent={agentFilter}
        scope={scope}
        brainScope={brainScope}
        brainMission={brainMissionId}
        brainAgent={brainAgentId}
        orgNode={orgNodeId}
      />

      <MemoryCommandCentre
        tab={tab}
        data={data}
        missionFilter={missionFilter}
        classificationFilter={classificationFilter}
        agentFilter={agentFilter}
        scope={scope}
        brainScope={brainScope}
        brainMissionId={brainMissionId}
        brainAgentId={brainAgentId}
        orgNodeId={orgNodeId}
        sandboxPath={sandboxPath}
        sandboxQuery={sandboxQuery}
        askSelectedFileId={askSelectedFileId}
        inboxItemType={inboxItemType}
        inboxSort={inboxSort}
        brainFileKindFilter={brainFileKindFilter}
        brainSandbox={brainSandbox}
      />
    </main>
  );
}
