import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { listSkills, listTools } from "@linktrend/linklogic-sdk";
import type { SkillRecord, ToolRecord } from "@linktrend/shared-types";

import { CapabilityConnectorsTable } from "@/components/capability-connectors-table";
import { SkillsCatalogTable, type SkillCatalogRow } from "@/components/skills-catalog-table";
import { ToolsCatalogTable, type ToolCatalogRow } from "@/components/tools-catalog-table";
import { WorkerLinkskillsSubnav } from "@/components/worker-linkskills-subnav";
import { WorkerTabSectionHeader } from "@/components/worker-tab-section-header";
import { workerLinkskillsSliceFromSearchParams, type WorkerLinkskillsSlice } from "@/lib/worker-linkskills-slice";
import { readSkillAdminFlags } from "@/lib/skills-admin";
import { readToolAdminFlags } from "@/lib/tools-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { DEMO_CONNECTOR_CATALOG_ROWS } from "@/lib/ui-mocks/capability-connectors-demo";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import {
  DEMO_TOOL_CATALOG_ROWS,
  mergeSkillCatalogWithDemo,
  mergeToolCatalogWithDemo,
} from "@/lib/ui-mocks/skills-tools-catalog-demo";
import { DEMO_AGENT_SKILLS, MOCK_UI_AGENT_SKILLS_ROWS, type DemoAgentSkillRow } from "@/lib/ui-mocks/worker-ui";
import { BUTTON } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

function demoSkillRowToCatalog(row: DemoAgentSkillRow, index: number): SkillCatalogRow {
  const slug = row.category.toLowerCase().replace(/\s+/g, "_");
  return {
    id: row.id || `demo-skill-${index}`,
    name: `linktrend.${slug}`,
    type: "Skill",
    category: row.category,
    description: row.description,
    published: row.status !== "disabled",
    runtimeEnabled: row.defaultOn && row.status === "enabled",
    status: row.status === "pending" ? "draft" : row.status === "disabled" ? "deprecated" : "approved",
    updated_at: `${row.updated}T12:00:00.000Z`,
    isFixture: true,
  };
}

function toSkillRow(s: SkillRecord): SkillCatalogRow {
  const flags = readSkillAdminFlags(s);
  return {
    id: String(s.id),
    name: s.name,
    type: "Skill",
    category: flags.category,
    description: flags.description,
    published: flags.published,
    runtimeEnabled: flags.runtimeEnabled,
    status: s.status,
    updated_at: s.updated_at,
  };
}

function toToolRow(t: ToolRecord): ToolCatalogRow {
  const flags = readToolAdminFlags(t);
  return {
    id: String(t.id),
    name: t.name,
    tool_type: t.tool_type,
    category: t.category,
    description: t.description,
    published: flags.published,
    runtimeEnabled: flags.runtimeEnabled,
    status: t.status,
    updated_at: t.updated_at,
  };
}

function linkskillsHubHref(slice: WorkerLinkskillsSlice): string {
  if (slice === "connectors") return "/skills/connectors";
  if (slice === "tools") return "/skills/tools";
  return "/skills/skills";
}

function SliceOpenAction(props: { slice: WorkerLinkskillsSlice }) {
  return (
    <Link href={linkskillsHubHref(props.slice)} className={`${BUTTON.secondaryRow} h-fit shrink-0`}>
      Open in LiNKskills
    </Link>
  );
}

function sliceSubtitle(slice: WorkerLinkskillsSlice, displayName: string): string {
  if (slice === "connectors") {
    return `Capabilities available to ${displayName} through governed leases.`;
  }
  if (slice === "tools") {
    return `Tools callable by ${displayName} when runtime policy and leases allow.`;
  }
  return `Skills assigned to ${displayName} — same catalogue layout as LiNKskills, scoped to this LiNKbot.`;
}

function demoConnectorRowsForAgent(agentId: string) {
  if (agentId === "demo-lisa") {
    return DEMO_CONNECTOR_CATALOG_ROWS.filter((r) =>
      ["plane", "odoo-crm", "research", "supabase"].includes(r.id),
    );
  }
  return DEMO_CONNECTOR_CATALOG_ROWS.filter((r) =>
    ["plane", "payload", "supabase", "zulip"].includes(r.id),
  );
}

function demoToolRowsForAgent(agentId: string) {
  const names =
    agentId === "demo-lisa"
      ? new Set(["memory_search", "mission_board"])
      : new Set(["memory_search", "gateway_zulip_mirror"]);
  return DEMO_TOOL_CATALOG_ROWS.filter((r) => names.has(r.name));
}

async function WorkerSkillsSliceContent(props: { agentId: string; slice: WorkerLinkskillsSlice; displayName: string }) {
  const { agentId, slice, displayName } = props;
  const uiMocksEnabled = isUiMocksEnabled();

  if (slice === "connectors") {
    const rows = isDemoAgentId(agentId)
      ? demoConnectorRowsForAgent(agentId)
      : uiMocksEnabled
        ? DEMO_CONNECTOR_CATALOG_ROWS.slice(0, 4)
        : DEMO_CONNECTOR_CATALOG_ROWS.slice(0, 4);

    return (
      <div className="space-y-4">
        <WorkerTabSectionHeader
          title="Capabilities"
          subtitle={sliceSubtitle(slice, displayName)}
          actions={<SliceOpenAction slice={slice} />}
        />
        <CapabilityConnectorsTable rows={rows} />
      </div>
    );
  }

  if (slice === "tools") {
    let rows: ToolCatalogRow[] = [];
    if (isDemoAgentId(agentId)) {
      rows = demoToolRowsForAgent(agentId);
    } else {
      const supabase = await createSupabaseServerClient();
      const { data } = await listTools(supabase, { limit: 400 });
      const apiRows = ((data ?? []) as ToolRecord[]).map(toToolRow);
      rows = uiMocksEnabled ? mergeToolCatalogWithDemo(apiRows).slice(0, 4) : apiRows.slice(0, 4);
      if (rows.length === 0 && uiMocksEnabled) {
        rows = DEMO_TOOL_CATALOG_ROWS.slice(0, 3);
      }
    }

    return (
      <div className="space-y-4">
        <WorkerTabSectionHeader
          title="Tools"
          subtitle={sliceSubtitle(slice, displayName)}
          actions={<SliceOpenAction slice={slice} />}
        />
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500">No tools assigned to this LiNKbot yet.</p>
        ) : (
          <ToolsCatalogTable rows={rows} />
        )}
      </div>
    );
  }

  let skillRows: SkillCatalogRow[] = [];
  if (isDemoAgentId(agentId)) {
    skillRows = (DEMO_AGENT_SKILLS[agentId] ?? []).map(demoSkillRowToCatalog);
  } else {
    const supabase = await createSupabaseServerClient();
    const { data } = await listSkills(supabase, { limit: 400 });
    const apiRows = ((data ?? []) as SkillRecord[]).map(toSkillRow);
    const merged = uiMocksEnabled ? mergeSkillCatalogWithDemo(apiRows) : apiRows;
    skillRows = merged.length > 0 ? merged.slice(0, 6) : MOCK_UI_AGENT_SKILLS_ROWS.map(demoSkillRowToCatalog);
  }

  return (
    <div className="space-y-4">
      <WorkerTabSectionHeader
        title="Skills"
        subtitle={sliceSubtitle("skills", displayName)}
        actions={<SliceOpenAction slice="skills" />}
      />
      {skillRows.length === 0 ? (
        <p className="text-sm text-zinc-500">No skills assigned to this LiNKbot yet.</p>
      ) : (
        <SkillsCatalogTable rows={skillRows} />
      )}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Company-wide catalogue lives under{" "}
        <Link href="/skills/skills" className="font-medium text-sky-800 underline-offset-2 hover:underline dark:text-sky-400">
          LiNKskills
        </Link>
        .
      </p>
    </div>
  );
}

export default async function WorkerSkillsPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ slice?: string }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const slice = workerLinkskillsSliceFromSearchParams(sp);

  if (isDemoAgentId(id)) {
    const displayName = id === "demo-lisa" ? "Lisa (CEO)" : "Eric (CTO)";
    return (
      <div className="space-y-6">
        <Suspense fallback={null}>
          <WorkerLinkskillsSubnav agentId={id} />
        </Suspense>
        <WorkerSkillsSliceContent agentId={id} slice={slice} displayName={displayName} />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: agent, error } = await supabase.schema("linkaios").from("agents").select("id, display_name").eq("id", id).maybeSingle();
  if (error || !agent) {
    notFound();
  }

  const displayName = String((agent as { display_name: string }).display_name);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <WorkerLinkskillsSubnav agentId={id} />
      </Suspense>
      <WorkerSkillsSliceContent agentId={id} slice={slice} displayName={displayName} />
    </div>
  );
}
