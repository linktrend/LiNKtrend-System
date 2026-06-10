
import { LinkbrainMemoryPageHeader } from "@/components/linkbrain/linkbrain-memory-page-header";
import { LinkbrainTabNav, LinkbrainRestrictedTabRedirect } from "@/components/linkbrain/linkbrain-tab-nav";
import { LinkbrainAuditPanel } from "@/components/linkbrain/linkbrain-audit-panel";
import { CollectiveMemoryTagFilters } from "@/components/linkbrain/collective-memory-filters";
import { MemoryCommandCentre } from "@/components/linkbrain/memory-command-centre";
import {
  inboxItemToSubmissionSource,
  type InboxSubmissionSource,
} from "@/components/linkbrain/linkbrain-labels";
import type { LinkbrainTab } from "@/lib/linkbrain-data";
import { loadLinkbrainPageData } from "@/lib/linkbrain-data";
import { enrichAdminCollectiveBrainPageData } from "@/lib/admin-collective-brain-data";
import { loadAdminProgramPickerOptions } from "@/lib/admin-projects-data";
import { parseLicensorScopeParam } from "@/lib/licensor-view-scope";
import { runBrainRetrievalSandbox } from "@/lib/brain-sandbox";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { resolveDemoBrainAgentId, demoBrainAgentSlugForId } from "@/lib/ui-mocks/linkbrain-demo-agents";
import { applyLinkbrainUiMockOverlay } from "@/lib/ui-mocks/linkbrain-demo-overlay";

import type { BrainInboxItemType, BrainRetrieveContextResult, BrainRetrieveStage, BrainScope } from "@linktrend/linklogic-sdk";

export type MemoryPageSearchParams = {
  tab?: string;
  mission?: string;
  classification?: string;
  agent?: string;
  b_company?: string;
  b_module?: string;
  b_mission?: string;
  b_agent?: string;
  b_path?: string;
  b_query?: string;
  b_stage?: string;
  b_file?: string;
  b_kind?: string;
  inbox_source?: string;
  inbox_item?: string;
  inbox_sort?: string;
  org?: string;
  c_industry?: string;
  c_pattern?: string;
  c_use_case?: string;
  c_submission?: string;
  /** LinkSites MVO run id — audit tab shows linkbrain.audit_events union for this run. */
  run?: string;
  /** Licensor sidebar View — synced to URL via role-preview provider. */
  scope?: string;
  err?: string;
};

const ORDERED_TABS: readonly LinkbrainTab[] = ["inbox", "project", "agent", "company", "ask", "audit"];

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

function parseBrainScopeFromAsk(sp: { b_agent?: string; b_mission?: string }): BrainScope {
  if (sp.b_agent?.trim()) return "agent";
  if (sp.b_mission?.trim()) return "mission";
  return "company";
}

const INBOX_TYPES: BrainInboxItemType[] = ["upload", "quick_note", "librarian", "edit_proposal", "standard"];

function parseInboxItem(v: string | undefined): BrainInboxItemType | null {
  if (v && INBOX_TYPES.includes(v as BrainInboxItemType)) return v as BrainInboxItemType;
  return null;
}

const INBOX_SOURCES: Exclude<InboxSubmissionSource, "all">[] = [
  "human_upload",
  "human_create",
  "human_edit",
  "executioner",
];

function parseInboxSource(
  sourceRaw: string | undefined,
  legacyItemRaw: string | undefined,
): Exclude<InboxSubmissionSource, "all"> | null {
  if (sourceRaw && INBOX_SOURCES.includes(sourceRaw as Exclude<InboxSubmissionSource, "all">)) {
    return sourceRaw as Exclude<InboxSubmissionSource, "all">;
  }
  const legacy = parseInboxItem(legacyItemRaw);
  return legacy ? inboxItemToSubmissionSource(legacy) : null;
}

export async function MemoryPageContent(props: {
  licensorCollective?: boolean;
  searchParams: MemoryPageSearchParams;
}) {
  const sp = props.searchParams;
  const tab = parseTab(sp.tab);
  const missionFilter = sp.mission?.trim();
  const classificationFilter = sp.classification?.trim();
  const agentFilterRaw = sp.agent?.trim();
  const uiMocksEnabled = isUiMocksEnabled();
  const agentFilter = uiMocksEnabled ? resolveDemoBrainAgentId(agentFilterRaw) : agentFilterRaw;
  const agentFilterDisplay = agentFilterRaw ?? (agentFilter ? demoBrainAgentSlugForId(agentFilter) : undefined);
  const scope = parseScope(sp.scope);
  const brainScope = parseBrainScopeFromAsk(sp);
  const brainCompanyId = sp.b_company?.trim() || undefined;
  const brainModuleId = sp.b_module?.trim() || undefined;
  const orgNodeId = sp.org?.trim();
  const brainMissionId =
    sp.b_mission?.trim() ?? (tab === "project" && missionFilter ? missionFilter : undefined);
  const brainAgentId =
    (uiMocksEnabled ? resolveDemoBrainAgentId(sp.b_agent?.trim()) : sp.b_agent?.trim()) ??
    (tab === "agent" && agentFilter ? agentFilter : undefined);
  let sandboxPath = sp.b_path?.trim();
  const sandboxQuery = sp.b_query?.trim();
  const inboxSource = parseInboxSource(sp.inbox_source?.trim(), sp.inbox_item?.trim());
  const inboxSort = sp.inbox_sort === "asc" ? "asc" : "desc";
  const collectiveTagFilters = {
    industry: sp.c_industry?.trim() || undefined,
    pattern: sp.c_pattern?.trim() || undefined,
    useCase: sp.c_use_case?.trim() || undefined,
    submissionSource: parseInboxSource(sp.c_submission?.trim(), undefined) ?? undefined,
  };
  const brainFileKindFilter = sp.b_kind?.trim() || null;
  const askSelectedFileId = sp.b_file?.trim() || undefined;

  const rawStage = sp.b_stage?.trim() ?? "";
  const allowedStages = new Set<BrainRetrieveStage>(["full", "orientation", "index_cards", "chunks"]);
  const brainRetrieveStage: BrainRetrieveStage = allowedStages.has(rawStage as BrainRetrieveStage)
    ? (rawStage as BrainRetrieveStage)
    : sandboxQuery
      ? "chunks"
      : "index_cards";

  const supabase = await createSupabaseServerClient();
  const licensorScope = props.licensorCollective ? parseLicensorScopeParam(sp.scope) : null;
  const adminPrograms = props.licensorCollective ? await loadAdminProgramPickerOptions(supabase) : [];
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
    inboxSource,
    inboxSort,
    brainFileKindFilter,
  });

  if (props.licensorCollective && adminPrograms.length > 0) {
    const adminIds = new Set(adminPrograms.map((p) => p.id));
    data = {
      ...data,
      missions: data.missions.filter((m) => adminIds.has(String(m.id))),
      missionRows: data.missionRows.filter((row) => adminIds.has(String(row.mission.id))),
    };
  }

  if (props.licensorCollective && licensorScope) {
    data = await enrichAdminCollectiveBrainPageData(supabase, data, {
      tab,
      licensorScope,
      missionId: missionFilter,
      agentId: agentFilter,
      adminProgramIds: adminPrograms.map((p) => p.id),
    });
  }

  if (uiMocksEnabled && !data.error && !props.licensorCollective) {
    data = applyLinkbrainUiMockOverlay(data, { tab, brainMissionId, brainAgentId });
  }

  if (tab === "ask" && !sandboxPath && askSelectedFileId) {
    const hit = data.brainPartitionFiles.find((f) => f.id === askSelectedFileId);
    if (hit) sandboxPath = hit.logical_path;
  }

  let brainSandbox: BrainRetrieveContextResult | null = null;
  if (tab === "ask" && sandboxQuery) {
    brainSandbox = await runBrainRetrievalSandbox(supabase, {
      scope: brainScope,
      logicalPath: sandboxPath ?? "",
      query: sandboxQuery,
      missionId: brainMissionId,
      agentId: brainAgentId,
      stage: brainRetrieveStage,
    });
  }

  return (
    <main className="space-y-6">
      <LinkbrainRestrictedTabRedirect active={tab} />
      <LinkbrainMemoryPageHeader tab={tab} />

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
        agent={agentFilterDisplay ?? agentFilter}
        scope={scope}
        brainScope={brainScope}
        brainMission={brainMissionId}
        brainAgent={brainAgentId}
        orgNode={orgNodeId}
        cIndustry={collectiveTagFilters.industry}
        cPattern={collectiveTagFilters.pattern}
        cUseCase={collectiveTagFilters.useCase}
        cSubmission={collectiveTagFilters.submissionSource}
      />

      {props.licensorCollective && tab !== "orgScope" ? (
        <CollectiveMemoryTagFilters
          tab={tab}
          filters={collectiveTagFilters}
          mission={missionFilter}
          agent={agentFilter}
          org={orgNodeId}
          scope={scope}
          inboxSort={inboxSort}
        />
      ) : null}

      {tab !== "audit" ? (
        <MemoryCommandCentre
          tab={tab}
          data={data}
          missionFilter={missionFilter}
          classificationFilter={classificationFilter}
          agentFilter={agentFilter}
          scope={scope}
          brainCompanyId={brainCompanyId}
          brainModuleId={brainModuleId}
          brainMissionId={brainMissionId}
          brainAgentId={brainAgentId}
          orgNodeId={orgNodeId}
          sandboxPath={sandboxPath}
          sandboxQuery={sandboxQuery}
          askSelectedFileId={askSelectedFileId}
          inboxSource={inboxSource}
          inboxSort={inboxSort}
          brainFileKindFilter={brainFileKindFilter}
          brainSandbox={brainSandbox}
          brainRetrieveStage={brainRetrieveStage}
          collectiveTagFilters={collectiveTagFilters}
          adminPrograms={adminPrograms}
          collectiveDemoOverlay={false}
        />
      ) : null}

      {tab === "audit" ? (
        <LinkbrainAuditPanel licensorCollective={props.licensorCollective} mvoRunId={sp.run?.trim() || null} />
      ) : null}
    </main>
  );
}
