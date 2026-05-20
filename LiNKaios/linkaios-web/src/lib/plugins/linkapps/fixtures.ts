import type { LinkappsFactoryFixture } from "./types";

/** Static demo bundle for `/linkapps/factory` — no I/O. */
export const LINKAPPS_FACTORY_DEMO_FIXTURE: LinkappsFactoryFixture = {
  context: {
    tenantId: "tenant_demo_01",
    runId: "run_linkapps_7f3a9c",
    traceId: "trace_a11y_fixture",
    ventureId: "venture_blueprint_lab",
    status: "running",
  },
  blueprint: {
    ventureId: "venture_blueprint_lab",
    blueprintRef: "brain:AppBlueprint/demo-fixture-001",
    prdRef: "brain:PrdSlice/demo-fixture-prd",
    appSlug: "demo-saas-mvo",
    appName: "Demo SaaS (fixture)",
    state: "bound",
  },
  squad: [
    {
      roleId: "technical_lead",
      label: "Technical lead",
      stageId: "linkapps.phase5.squad_formation",
      state: "done",
    },
    {
      roleId: "product_owner",
      label: "Product owner",
      stageId: "linkapps.phase5.repo_generation",
      state: "done",
    },
    {
      roleId: "frontend_specialist",
      label: "Frontend specialist",
      stageId: "linkapps.phase5.ai_implementation",
      state: "active",
    },
    {
      roleId: "backend_specialist",
      label: "Backend specialist",
      stageId: "linkapps.phase5.ai_implementation",
      state: "active",
    },
    {
      roleId: "qa_automation_engineer",
      label: "QA automation",
      stageId: "linkapps.phase5.quality_validation",
      state: "pending",
    },
    {
      roleId: "devops_engineer",
      label: "DevOps",
      stageId: "linkapps.phase5.deployment",
      state: "pending",
    },
  ],
  leases: [
    {
      leaseId: "lease_git_001",
      skuLabel: "github.repo.template_materialize",
      phase: "executed",
      retryable: false,
    },
    {
      leaseId: "lease_sb_002",
      skuLabel: "supabase.project.stub",
      phase: "granted",
      retryable: true,
    },
    {
      leaseId: "lease_vc_003",
      skuLabel: "vercel.deploy.record",
      phase: "requested",
      retryable: true,
    },
  ],
  workflows: [
    {
      manifestStageId: "linkapps.phase5.repo_generation",
      displayLabel: "5.2 Repository generation",
      workflowRunId: "aw_run_repo_91aa",
      state: "succeeded",
    },
    {
      manifestStageId: "linkapps.phase5.service_provisioning",
      displayLabel: "5.3 Service provisioning",
      workflowRunId: "aw_run_svc_44bb",
      state: "running",
    },
    {
      manifestStageId: "linkapps.phase5.quality_validation",
      displayLabel: "5.5 Quality validation",
      workflowRunId: "aw_run_val_ccdd",
      state: "queued",
    },
  ],
  buildLogs: [
    {
      at: "2026-05-17T14:02:11Z",
      message: "Local web build recorded (mock)",
      ref: "artifact:bundle/web-build.tgz",
    },
    {
      at: "2026-05-17T14:06:48Z",
      message: "Iteration checkpoint",
      ref: "manifest:files_changed/demo-iteration-03",
    },
  ],
  validationLines: [
    {
      at: "2026-05-17T14:08:02Z",
      message: "lint — passed (fixture)",
      ref: "validation_report_ref:stub-001",
    },
    {
      at: "2026-05-17T14:08:45Z",
      message: "unit — passed (fixture)",
      ref: "validation_report_ref:stub-001",
    },
  ],
  deploymentLines: [
    {
      at: "2026-05-17T14:10:12Z",
      message: "Preview URL fixture emitted",
      ref: "deployment_refs:preview/demo-fixture",
    },
  ],
  handoff: {
    handoffPackageRef: "handoff:pack/demo-pending",
    auditEventIds: ["audit_evt_handoff_ready_stub", "audit_evt_deploy_stub"],
    deploymentRefs: ["deploy:vercel_preview_fixture"],
    previewUrls: ["https://preview.example.invalid/demo-fixture"],
  },
  auditSpine: [
    { id: "evt_run_started", verb: "run.started", at: "2026-05-17T13:55:00Z" },
    { id: "evt_stage_repo", verb: "stage.completed", at: "2026-05-17T13:58:20Z" },
    { id: "evt_lease_git", verb: "lease.executed", at: "2026-05-17T13:59:01Z" },
    { id: "evt_wf_repo", verb: "workflow.completed", at: "2026-05-17T13:59:40Z" },
    { id: "evt_wf_svc", verb: "workflow.invoked", at: "2026-05-17T14:00:05Z" },
  ],
};
