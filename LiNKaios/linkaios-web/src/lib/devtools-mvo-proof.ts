import { buildPreviewPanelView, generatePreviewRoute } from "@/lib/suite-integrations/websitefactory/preview-panel";
import { buildLexosOperatorFlowProof } from "@/lib/suite-integrations/lexos-litigation/operator-flow";
import { buildLinkappsOperatorFlowProof } from "@/lib/suite-integrations/linkapps-app-factory/operator-flow";
import {
  readMvoLatestRunManifest,
  resolveMvoRunManifestPath,
  type MvoLatestRunManifest,
} from "@/lib/mvo-run-manifest";

const SAMPLE_RUN_ID = "11111111-1111-4111-8111-111111111111";
const SAMPLE_WORK_REQUEST_ID = "22222222-2222-4222-8222-222222222222";
const SAMPLE_TENANT_ID = "tenant-dev";

export type DevtoolsMvoProof = {
  source: "persisted-run" | "static-sample";
  manifestPath: string | null;
  websitefactory: {
    run_id: string;
    project_id: string | null;
    status: string;
    timeline: { stage_id: string; status: string; started_at?: string; ended_at?: string }[];
    lease_ids: string[];
    workflow_run_ids: string[];
    audit_event_ids: string[];
    bot_refs: string[];
    preview: { preview_url: string; preview_artifact_ref: string; preview_local_route: string };
  };
  lexos: ReturnType<typeof buildLexosOperatorFlowProof>;
  linkapps: ReturnType<typeof buildLinkappsOperatorFlowProof>;
};

function buildStaticWebsitefactoryProof(): DevtoolsMvoProof["websitefactory"] {
  const now = new Date("2026-05-18T10:00:00.000Z").toISOString();
  const wfStages = [
    {
      stage_id: "lead_intake",
      run_id: SAMPLE_RUN_ID,
      responsible_plane: "linkaios" as const,
      status: "succeeded" as const,
      attempt: 1,
      inputs_snapshot: {},
      outputs: {},
      started_at: now,
      ended_at: now,
      refs: {
        lease_ids: ["lease:cap.crm.upsert:tenant-dev:lead_intake"],
        workflow_run_ids: ["wf:autowork.websitefactory.lead_intake:tenant-dev:run-1"],
        audit_event_ids: ["audit:lead.intake.accepted:tenant-dev:run-1"],
      },
    },
    {
      stage_id: "preview_publish",
      run_id: SAMPLE_RUN_ID,
      responsible_plane: "linkautowork" as const,
      status: "succeeded" as const,
      attempt: 1,
      inputs_snapshot: {},
      outputs: {},
      started_at: now,
      ended_at: now,
      refs: {
        lease_ids: ["lease:cap.preview.publish:tenant-dev:preview_publish"],
        workflow_run_ids: ["wf:autowork.websitefactory.preview_publish:tenant-dev:run-1"],
        audit_event_ids: ["audit:preview.published:tenant-dev:run-1"],
      },
    },
  ];

  const wfRun = {
    run_id: SAMPLE_RUN_ID,
    work_request_id: SAMPLE_WORK_REQUEST_ID,
    tenant_id: SAMPLE_TENANT_ID,
    plugin_id: "websitefactory",
    status: "succeeded" as const,
    started_at: now,
    ended_at: now,
    stages: wfStages,
    outputs: {
      preview_url: "https://preview.local/tenant-dev/run-1",
      preview_artifact_ref: "artifact:websitefactory:tenant-dev:run-1",
      crm_record_id: "crm:tenant-dev:lead-1",
      project_id: "plane:tenant-dev:project-1",
      task_id: "plane:tenant-dev:task-1",
    },
  };

  const preview = buildPreviewPanelView(wfRun, wfStages);

  return {
    run_id: preview.runId,
    project_id: null,
    status: preview.status,
    timeline: wfStages.map((stage) => ({
      stage_id: stage.stage_id,
      status: stage.status,
      started_at: stage.started_at,
      ended_at: stage.ended_at,
    })),
    lease_ids: preview.leaseIds,
    workflow_run_ids: preview.workflowRunIds,
    audit_event_ids: preview.auditEventIds,
    bot_refs: ["bot:websitefactory_researcher", "bot:websitefactory_copywriter", "bot:websitefactory_publisher"],
    preview: {
      preview_url: preview.previewUrl,
      preview_artifact_ref: preview.previewArtifactRef,
      preview_local_route: generatePreviewRoute(SAMPLE_TENANT_ID, SAMPLE_RUN_ID),
    },
  };
}

function websitefactoryFromManifest(manifest: MvoLatestRunManifest): DevtoolsMvoProof["websitefactory"] {
  return {
    run_id: manifest.run_id,
    project_id: manifest.project_id,
    status: manifest.status,
    timeline: manifest.phase_timeline.map((stage) => ({
      stage_id: stage.stage_id,
      status: stage.status,
      started_at: stage.started_at,
      ended_at: stage.ended_at,
    })),
    lease_ids: manifest.lease_ids,
    workflow_run_ids: manifest.workflow_run_ids,
    audit_event_ids: manifest.audit_event_ids,
    bot_refs: [],
    preview: {
      preview_url: manifest.preview_url ?? manifest.publish_url ?? "",
      preview_artifact_ref: manifest.preview_artifact_ref ?? "",
      preview_local_route: generatePreviewRoute(manifest.tenant_id, manifest.run_id),
    },
  };
}

export function buildDevtoolsMvoProof(opts: { cwd?: string } = {}): DevtoolsMvoProof {
  const manifest = readMvoLatestRunManifest(opts.cwd);
  const websitefactory = manifest ? websitefactoryFromManifest(manifest) : buildStaticWebsitefactoryProof();

  return {
    source: manifest ? "persisted-run" : "static-sample",
    manifestPath: manifest ? resolveMvoRunManifestPath(opts.cwd) : null,
    websitefactory,
    lexos: buildLexosOperatorFlowProof({
      run_id: "run-lexos-proof-1",
      tenant_id: SAMPLE_TENANT_ID,
      matter_id: "matter-001",
      client_id: "client-001",
      jurisdiction: "TW-TPE",
    }),
    linkapps: buildLinkappsOperatorFlowProof({
      run_id: "run-linkapps-proof-1",
      tenant_id: SAMPLE_TENANT_ID,
      venture_id: "venture-001",
      app_slug: "nova-app",
    }),
  };
}
