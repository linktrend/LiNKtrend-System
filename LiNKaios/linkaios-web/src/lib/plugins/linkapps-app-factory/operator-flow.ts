export type LinkappsBrief = {
  venture_id: string;
  app_slug: string;
  prd_ref: string;
  blueprint_ref: string;
};

export type LinkappsSquadStatus = {
  status: "formed" | "executing" | "handoff_ready";
  active_roles: string[];
};

export type LinkappsProviderReadiness = {
  github: "mock_ready" | "shadow_ready";
  supabase: "mock_ready" | "shadow_ready";
  stripe: "mock_ready" | "shadow_ready";
  vercel: "mock_ready" | "shadow_ready";
  eas: "mock_ready" | "shadow_ready";
  plane: "mock_ready" | "shadow_ready";
};

export type LinkappsOperatorTask = {
  task_id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
};

export type LinkappsOperatorFlowProof = {
  module: "linkapps.app_factory";
  app_brief: LinkappsBrief;
  squad_status: LinkappsSquadStatus;
  provider_readiness: LinkappsProviderReadiness;
  tasks: LinkappsOperatorTask[];
  handoff_package: {
    handoff_package_ref: string;
    preview_urls: string[];
    workflow_run_ids: string[];
  };
  trace: {
    lease_ids: string[];
    audit_event_ids: string[];
    governed_refs: {
      linkskills_capability_refs: string[];
      linkautowork_handles: string[];
      linkbrain_event_refs: string[];
      linkbot_role_refs: string[];
      plane_task_refs: string[];
    };
  };
};

export function buildLinkappsOperatorFlowProof(input: {
  run_id: string;
  tenant_id: string;
  venture_id: string;
  app_slug: string;
}): LinkappsOperatorFlowProof {
  const prefix = `${input.tenant_id}:${input.run_id}`;
  return {
    module: "linkapps.app_factory",
    app_brief: {
      venture_id: input.venture_id,
      app_slug: input.app_slug,
      prd_ref: `prd:${prefix}`,
      blueprint_ref: `blueprint:${prefix}`,
    },
    squad_status: {
      status: "executing",
      active_roles: ["technical_lead", "frontend_specialist", "backend_specialist", "devops_engineer"],
    },
    provider_readiness: {
      github: "mock_ready",
      supabase: "shadow_ready",
      stripe: "mock_ready",
      vercel: "shadow_ready",
      eas: "mock_ready",
      plane: "shadow_ready",
    },
    tasks: [
      { task_id: `plane:${prefix}:repo`, title: "Repo generation", status: "done" },
      { task_id: `plane:${prefix}:validation`, title: "Quality validation", status: "in_progress" },
      { task_id: `plane:${prefix}:handoff`, title: "Handoff package", status: "todo" },
    ],
    handoff_package: {
      handoff_package_ref: `handoff:${prefix}`,
      preview_urls: [`https://preview.local/${input.app_slug}`],
      workflow_run_ids: [
        `wf:autowork.linkapps.create_repo:${prefix}`,
        `wf:autowork.linkapps.release_readiness:${prefix}`,
        `wf:autowork.linkapps.compile_handoff:${prefix}`,
      ],
    },
    trace: {
      lease_ids: [
        `lease:cap.github.repo_management:${prefix}`,
        `lease:cap.supabase.provisioning:${prefix}`,
        `lease:cap.plane.execution_tracking:${prefix}`,
      ],
      audit_event_ids: [
        `audit:linkapps.squad.formed:${prefix}`,
        `audit:linkapps.validation.passed:${prefix}`,
        `audit:linkapps.handoff.ready:${prefix}`,
      ],
      governed_refs: {
        linkskills_capability_refs: ["cap.github.repo_management", "cap.supabase.provisioning", "cap.plane.execution_tracking"],
        linkautowork_handles: ["autowork.linkapps.create_repo", "autowork.linkapps.release_readiness", "autowork.linkapps.compile_handoff"],
        linkbrain_event_refs: ["linkapps.squad.formed", "linkapps.validation.passed", "linkapps.handoff.ready"],
        linkbot_role_refs: ["technical_lead", "frontend_specialist", "backend_specialist", "devops_engineer"],
        plane_task_refs: [`plane:${prefix}:repo`, `plane:${prefix}:validation`, `plane:${prefix}:handoff`],
      },
    },
  };
}
