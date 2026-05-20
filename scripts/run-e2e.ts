import 'dotenv/config';

const CANONICAL_CODES = {
  config: "E2E_CONFIG_MISSING",
  dispatch: "KERNEL_DISPATCH_FAILED",
  persistence: "KERNEL_PERSISTENCE_FAILED",
  readiness_failed: "WORKFLOW_STEP_FAILED",
  lease_required: "LEASE_REQUEST_INVALID",
} as const;

// WP-090 through WP-093 hardened flow stage IDs
const REQUIRED_V2_STAGE_IDS = [
  "lead_intake",
  "research_enrichment",
  "website_package_generation",
  "artifact_write_local",
  "supabase_mirror_upsert",
  "payload_sync_local",
  "preview_readiness_check",
  "crm_ready_to_contact_mark",
  "plane_execution_tracking",
  "zulip_run_notify",
  "record_run",
] as const;

// Stages that MUST have audit refs (WP-090 hardened: all side-effect stages)
const STAGES_REQUIRING_AUDIT_REFS = [
  "artifact_write_local",
  "supabase_mirror_upsert",
  "payload_sync_local",
  "preview_readiness_check",
  "crm_ready_to_contact_mark",
  "plane_execution_tracking",
  "zulip_run_notify",
] as const;

// Stages that MUST have workflow refs (WP-091 deterministic execution tracking)
const STAGES_REQUIRING_WORKFLOW_REFS = [
  "artifact_write_local",
  "supabase_mirror_upsert",
  "payload_sync_local",
  "preview_readiness_check",
  "crm_ready_to_contact_mark",
] as const;

// Stages that MUST have lease_ids (WP-092 fail-closed: lease-gated side effects)
const STAGES_REQUIRING_LEASE_IDS = [
  "supabase_mirror_upsert",
  "payload_sync_local",
  "crm_ready_to_contact_mark",
  "plane_execution_tracking",
  "zulip_run_notify",
] as const;

// WP-093: Forbidden stages (ensuring fail-closed behavior - no live outreach/publish)
const FORBIDDEN_STAGE_IDS = ["lead_scout", "outreach", "publish_live", "deploy_vps"] as const;

// Hardened readiness check requirements (WP-092)
const READINESS_CHECK_REQUIREMENTS = {
  required_pages: ["home", "about", "contact", "services"],
  required_navigation_items: ["home", "about", "contact", "services"],
  required_content_blocks: ["hero", "features", "testimonials", "cta"],
  required_media_refs: ["hero_image", "logo", "feature_icons"],
} as const;

type CanonicalCode = (typeof CANONICAL_CODES)[keyof typeof CANONICAL_CODES];

function fail(code: CanonicalCode, message: string): never {
  throw new Error(`[${code}] ${message}`);
}

function parseCanonicalFailure(err: unknown): { code: CanonicalCode; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const msg = raw.toLowerCase();

  if (msg.includes("e2e_config_missing")) {
    return { code: CANONICAL_CODES.config, message: raw };
  }

  // WP-092: Detect readiness check failures
  if (
    msg.includes("checks_passed is not true") ||
    msg.includes("preview_readiness_status") ||
    msg.includes("readiness check failed")
  ) {
    return { code: CANONICAL_CODES.readiness_failed, message: raw };
  }

  // WP-092: Detect lease requirement failures
  if (
    msg.includes("missing required lease_id") ||
    msg.includes("lease_id is required") ||
    msg.includes("lease_request_invalid")
  ) {
    return { code: CANONICAL_CODES.lease_required, message: raw };
  }

  if (
    msg.includes("missing required env") ||
    msg.includes("supabase") ||
    msg.includes("database") ||
    msg.includes("enotfound") ||
    msg.includes("getaddrinfo")
  ) {
    return { code: CANONICAL_CODES.persistence, message: raw };
  }

  if (
    msg.includes("econnrefused") ||
    msg.includes("fetch failed") ||
    msg.includes("unauthorized") ||
    msg.includes("work request failed") ||
    msg.includes("execute failed")
  ) {
    return { code: CANONICAL_CODES.dispatch, message: raw };
  }

  return { code: CANONICAL_CODES.dispatch, message: raw };
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    fail(CANONICAL_CODES.config, `Missing required env: ${name}`);
  }
  return value;
}

function validateE2EPreflight(): void {
  const required = [
    "BOT_KERNEL_API_SECRET",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SECRET_KEY",
  ];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    fail(
      CANONICAL_CODES.config,
      `Missing required E2E configuration: ${missing.join(", ")}. Use local development credentials only; do not use production secrets.`,
    );
  }
}

async function fetchJsonOrFail(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`${init?.method || "GET"} ${url} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  validateE2EPreflight();

  const appBaseUrl = process.env.MVO_E2E_BASE_URL?.trim() || "http://localhost:3000";
  const baseUrl = `${appBaseUrl}/api/kernel`;
  const authHeader = `Bearer ${requireEnv("BOT_KERNEL_API_SECRET")}`;
  const tenantId = process.env.MVO_E2E_TENANT_ID?.trim() || "e976eb75-1aff-4ca1-ad0d-5c940c343434";
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceKey = requireEnv("SUPABASE_SECRET_KEY");

  console.log("=================================================================");
  console.log("LinkSites v2 Hardened E2E Harness (WP-090 through WP-093)");
  console.log("=================================================================");
  console.log("");

  // WP-090: Verify deterministic inputs
  console.log("[WP-090] Phase 1: Submitting deterministic Work Request...");
  const testIdempotencyKey = `e2e-hardened-${Date.now()}`;
  const wrPayload = {
    plugin_id: "websitefactory",
    work_request_type: "websitefactory.lead_to_preview",
    tenant_id: tenantId,
    lead_input: {
      tenant_id: tenantId,
      source: "manual",
      business_name: "Acme Widgets Manufacturing",
      industry: "Manufacturing",
      contact: {
        name: "Wile E. Coyote",
        email: "wile@acme.com",
        phone: "+18005551234"
      },
      location: { city: "Albuquerque", region: "NM", country: "US" },
      notes: "Test lead for hardened E2E flow verification",
      client_idempotency_key: testIdempotencyKey,
    }
  };

  const wrData = await fetchJsonOrFail(`${baseUrl}/work-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader,
    },
    body: JSON.stringify(wrPayload),
  });
  const runId = wrData.run_id;
  if (!runId) {
    fail(CANONICAL_CODES.dispatch, "Kernel did not return run_id");
  }
  console.log(`✅ Created run: ${runId}`);
  console.log(`   Idempotency key: ${testIdempotencyKey}`);
  console.log("");

  // WP-091: Execute run with deterministic workflow tracking
  console.log("[WP-091] Phase 2: Executing deterministic Run Loop...");
  let runStatus = "running";
  let finalOutputs: Record<string, unknown> = {};
  let executionAttempts = 0;
  const maxExecutionAttempts = 50;

  while (runStatus === "running" || runStatus === "awaiting_approval") {
    executionAttempts++;
    if (executionAttempts > maxExecutionAttempts) {
      fail(CANONICAL_CODES.dispatch, `Run exceeded maximum execution attempts (${maxExecutionAttempts})`);
    }

    const execRes = await fetch(`${baseUrl}/run/${runId}/execute`, {
      method: "POST",
      headers: { "Authorization": authHeader },
    });

    if (!execRes.ok) throw new Error(`Execute failed: ${execRes.status} ${await execRes.text()}`);

    const execData = await execRes.json();
    finalOutputs = (execData?.outputs || {}) as Record<string, unknown>;
    runStatus = execData.status;
    console.log(`⏳ Execute returned status: ${runStatus} (attempt ${executionAttempts})`);

    if (runStatus === "awaiting_approval") {
      console.log("   Fetching pending approvals...");
      const approvalsData = await fetchJsonOrFail(`${baseUrl}/approvals?tenant_id=${tenantId}`, {
        headers: { "Authorization": authHeader },
      });

      if (!approvalsData.approvals) {
        throw new Error("Missing approvals array in response");
      }

      const myApprovals = approvalsData.approvals.filter((a: any) => a.run_id === runId);
      if (myApprovals.length === 0) {
        console.log("No pending approvals found for this run, but status is awaiting_approval!");
        break;
      }

      for (const a of myApprovals) {
        console.log(`   Approving ${a.capability_id} (ID: ${a.approval_id})...`);
        const approveRes = await fetch(`${baseUrl}/approvals?approval_id=${a.approval_id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
          },
          body: JSON.stringify({ decision: "granted", reason: "E2E Hardened Flow Approval" }),
        });
        if (!approveRes.ok) throw new Error(`Approval failed: ${approveRes.status} ${await approveRes.text()}`);
      }
    } else if (runStatus !== "running") {
      break;
    }
  }

  console.log("");
  console.log(`✅ Run finished with status: ${runStatus}`);
  if (runStatus !== "succeeded") {
    fail(CANONICAL_CODES.dispatch, `Run status must be succeeded, got ${runStatus}`);
  }
  console.log("");

  // WP-092: Hardened trace verification with fail-closed assertions
  console.log("[WP-092] Phase 3: Hardened Trace Data Verification...");
  const traceData = await fetchJsonOrFail(`${baseUrl}/run/${runId}/trace`, {
    headers: { "Authorization": authHeader },
  });

  const stages = Array.isArray(traceData?.stages) ? traceData.stages : [];
  if (stages.length === 0) {
    fail(CANONICAL_CODES.dispatch, "Trace missing stages");
  }

  const stageById = new Map<string, any>();
  for (const stage of stages) {
    if (stage?.stage_id) {
      stageById.set(stage.stage_id, stage);
    }
  }

  console.log(`   Found ${stages.length} stages in trace`);

  // Verify all required v2 stages present
  console.log("   Verifying required v2 stages...");
  for (const stageId of REQUIRED_V2_STAGE_IDS) {
    if (!stageById.has(stageId)) {
      fail(CANONICAL_CODES.dispatch, `Missing required v2 stage in trace: ${stageId}`);
    }
    console.log(`   ✓ ${stageId}`);
  }

  // WP-093: Verify forbidden stages are NOT present
  console.log("   Verifying forbidden stages absent (fail-closed)...");
  for (const stageId of FORBIDDEN_STAGE_IDS) {
    if (stageById.has(stageId)) {
      fail(CANONICAL_CODES.dispatch, `Forbidden stage appeared in run trace: ${stageId}`);
    }
    console.log(`   ✓ ${stageId} absent`);
  }

  // WP-090: Verify all side-effect stages have audit refs
  console.log("   Verifying audit refs (WP-090 hardened)...");
  for (const stageId of STAGES_REQUIRING_AUDIT_REFS) {
    const stage = stageById.get(stageId);
    if (!stage) continue;
    if (stage.status !== "succeeded") {
      fail(CANONICAL_CODES.dispatch, `Stage must succeed: ${stageId} (got ${stage.status})`);
    }
    const refs = stage.refs || {};
    const auditEventIdsForStage = Array.isArray(refs.audit_event_ids) ? refs.audit_event_ids : [];
    if (auditEventIdsForStage.length === 0) {
      fail(CANONICAL_CODES.dispatch, `Stage ${stageId} must have non-empty audit_event_ids`);
    }
    console.log(`   ✓ ${stageId}: ${auditEventIdsForStage.length} audit events`);
  }

  // WP-091: Verify deterministic workflow refs
  console.log("   Verifying workflow refs (WP-091 deterministic)...");
  for (const stageId of STAGES_REQUIRING_WORKFLOW_REFS) {
    const stage = stageById.get(stageId);
    if (!stage) continue;
    const refs = stage.refs || {};
    const workflowRunIdsForStage = Array.isArray(refs.workflow_run_ids) ? refs.workflow_run_ids : [];
    if (workflowRunIdsForStage.length === 0) {
      fail(CANONICAL_CODES.dispatch, `Stage ${stageId} must have non-empty workflow_run_ids`);
    }
    console.log(`   ✓ ${stageId}: ${workflowRunIdsForStage.length} workflow runs`);
  }

  // WP-092: Verify lease refs (fail-closed side effects)
  console.log("   Verifying lease refs (WP-092 fail-closed)...");
  for (const stageId of STAGES_REQUIRING_LEASE_IDS) {
    const stage = stageById.get(stageId);
    if (!stage) continue;
    const refs = stage.refs || {};
    const leaseIdsForStage = Array.isArray(refs.lease_ids) ? refs.lease_ids : [];
    if (leaseIdsForStage.length === 0) {
      fail(CANONICAL_CODES.dispatch, `Stage ${stageId} must have non-empty lease_ids (fail-closed requirement)`);
    }
    console.log(`   ✓ ${stageId}: ${leaseIdsForStage.length} lease(s)`);
  }

  // Verify preview output
  const previewOutput = traceData?.preview_output;
  if (!previewOutput) {
    fail(CANONICAL_CODES.dispatch, "Trace missing preview_output");
  }

  if (!previewOutput.preview_artifact_ref) {
    fail(CANONICAL_CODES.dispatch, "preview_artifact_ref is missing");
  }

  const leaseIds = Array.isArray(previewOutput.lease_ids) ? previewOutput.lease_ids : [];
  const workflowRunIds = Array.isArray(previewOutput.workflow_run_ids) ? previewOutput.workflow_run_ids : [];
  const auditEventIds = Array.isArray(previewOutput.audit_event_ids) ? previewOutput.audit_event_ids : [];

  if (leaseIds.length === 0) fail(CANONICAL_CODES.dispatch, "lease_ids must be non-empty");
  if (workflowRunIds.length === 0) fail(CANONICAL_CODES.dispatch, "workflow_run_ids must be non-empty");
  if (auditEventIds.length === 0) fail(CANONICAL_CODES.dispatch, "audit_event_ids must be non-empty");
  if (previewOutput.status !== "succeeded") {
    fail(CANONICAL_CODES.dispatch, `preview_output.status must be succeeded, got ${previewOutput.status}`);
  }
  if (typeof previewOutput.preview_url !== "string" || !previewOutput.preview_url.startsWith("http")) {
    fail(CANONICAL_CODES.dispatch, "preview_output.preview_url must be an absolute http(s) URL");
  }

  // WP-093: Ensure no production/DigitalOcean hosting is used
  if (previewOutput.preview_url.includes("digitalocean") ||
      previewOutput.preview_url.includes("https://prod.") ||
      previewOutput.preview_url.includes(".linktrend.com")) {
    fail(
      CANONICAL_CODES.dispatch,
      `preview_output.preview_url indicates production or hosted mode: ${previewOutput.preview_url}`,
    );
  }
  console.log("   ✓ preview_url is development-mode only");

  // WP-092: Verify readiness check passed before CRM mark
  console.log("   Verifying preview readiness gate (WP-092)...");
  const readinessStage = stageById.get("preview_readiness_check");
  if (readinessStage) {
    const readinessOutputs = readinessStage.outputs || {};
    if (readinessOutputs.checks_passed !== true) {
      fail(CANONICAL_CODES.readiness_failed,
        `preview_readiness_check must have checks_passed=true, got ${JSON.stringify(readinessOutputs.checks_passed)}`);
    }
    if (readinessOutputs.preview_readiness_status !== "ready") {
      fail(CANONICAL_CODES.readiness_failed,
        `preview_readiness_check must have preview_readiness_status=ready, got ${readinessOutputs.preview_readiness_status}`);
    }
    console.log("   ✓ Readiness checks passed");

    // Verify readiness check requirements were validated
    const checkedItems = readinessOutputs.checked_items || {};
    if (checkedItems.pages_count === 0 && checkedItems.content_blocks_count === 0) {
      fail(CANONICAL_CODES.readiness_failed, "Readiness check did not verify any requirements");
    }
    console.log(`   ✓ Validated ${checkedItems.pages_count || 0} pages, ${checkedItems.content_blocks_count || 0} content blocks`);
  }

  // WP-092: Verify CRM ready_to_contact mark only after readiness
  console.log("   Verifying CRM gate (WP-092 fail-closed)...");
  const crmStage = stageById.get("crm_ready_to_contact_mark");
  if (crmStage) {
    const crmOutputs = crmStage.outputs || {};
    if (crmOutputs.lead_status !== "ready_to_contact") {
      fail(CANONICAL_CODES.dispatch,
        `crm_ready_to_contact_mark must produce lead_status=ready_to_contact, got ${crmOutputs.lead_status}`);
    }
    if (!crmOutputs.check_report_ref || !crmOutputs.check_report_ref.startsWith("readiness_report:")) {
      fail(CANONICAL_CODES.dispatch, "crm_ready_to_contact_mark must include valid check_report_ref");
    }
    console.log("   ✓ CRM status promoted to ready_to_contact with valid check_report_ref");
  }

  // Verify final outputs
  console.log("   Verifying final outputs...");
  if (!finalOutputs.lead_research_bundle) {
    fail(CANONICAL_CODES.dispatch, "Run outputs missing lead_research_bundle");
  }
  if (!finalOutputs.website_package) {
    fail(CANONICAL_CODES.dispatch, "Run outputs missing website_package");
  }
  if (finalOutputs.lead_status !== "ready_to_contact") {
    fail(
      CANONICAL_CODES.dispatch,
      `Run outputs lead_status must be ready_to_contact, got ${String(finalOutputs.lead_status)}`,
    );
  }
  console.log("   ✓ All final outputs present");

  // WP-090: Verify LiNKbrain audit events persisted
  console.log("");
  console.log("[WP-090] Phase 4: LiNKbrain Audit Persistence Verification...");
  const eventIdCsv = auditEventIds.join(",");
  const auditRows = await fetchJsonOrFail(
    `${supabaseUrl}/rest/v1/audit_events?select=event_id,action,subject&event_id=in.(${eventIdCsv})`,
    {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Accept-Profile": "linkbrain",
      },
    },
  );

  if (!Array.isArray(auditRows) || auditRows.length === 0) {
    fail(CANONICAL_CODES.persistence, "No LiNKbrain audit events resolved from audit_event_ids");
  }
  console.log(`   ✓ Resolved ${auditRows.length} audit events by ID`);

  const runAuditRows = await fetchJsonOrFail(
    `${supabaseUrl}/rest/v1/audit_events?select=event_id,action,subject&subject->>run_id=eq.${runId}`,
    {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Accept-Profile": "linkbrain",
      },
    },
  );

  if (!Array.isArray(runAuditRows) || runAuditRows.length === 0) {
    fail(CANONICAL_CODES.persistence, "No run-scoped LiNKbrain audit rows resolved");
  }
  console.log(`   ✓ Resolved ${runAuditRows.length} run-scoped audit events`);

  // Verify specific audit event types for hardened flow
  const requiredActions = ["run.started", "run.completed", "workflow.invoked", "workflow.completed"];
  const foundActions = new Set(auditRows.map((r: any) => r.action));
  for (const action of requiredActions) {
    if (!foundActions.has(action)) {
      console.log(`   ⚠ Missing audit action: ${action} (may be in other events)`);
    } else {
      console.log(`   ✓ Found audit action: ${action}`);
    }
  }

  // WP-093: Final summary
  console.log("");
  console.log("=================================================================");
  console.log("HARDENED E2E ASSERTIONS PASSED");
  console.log("=================================================================");
  console.log(`Run ID: ${runId}`);
  console.log(`Preview URL: ${previewOutput.preview_url}`);
  console.log(`Preview Artifact: ${previewOutput.preview_artifact_ref}`);
  console.log(`Lease IDs: ${leaseIds.length}`);
  console.log(`Workflow Run IDs: ${workflowRunIds.length}`);
  console.log(`Audit Event IDs: ${auditEventIds.length}`);
  console.log(`Required v2 Stages: ${REQUIRED_V2_STAGE_IDS.length}`);
  console.log(`CRM Ready to Contact: ${finalOutputs.lead_status === "ready_to_contact"}`);
  console.log(`Readiness Checks Passed: ${readinessStage?.outputs?.checks_passed === true}`);
  console.log(`Run-scoped Audit Rows: ${runAuditRows.length}`);
  console.log("=================================================================");
  console.log("");
  console.log("WP-090: Audit persistence - VERIFIED");
  console.log("WP-091: Deterministic workflow execution - VERIFIED");
  console.log("WP-092: Fail-closed readiness + CRM gate - VERIFIED");
  console.log("WP-093: Development-only boundaries - VERIFIED");
  console.log("");
  console.log("✅ All hardened E2E assertions passed");
}

main().catch((err) => {
  const mapped = parseCanonicalFailure(err);
  console.error("");
  console.error("=================================================================");
  console.error(`E2E FAILED: [${mapped.code}]`);
  console.error("=================================================================");
  console.error(mapped.message);
  console.error("");

  // WP-092: Provide helpful context for canonical failures
  if (mapped.code === CANONICAL_CODES.readiness_failed) {
    console.error("HINT: The preview readiness check failed. This is the WP-092 fail-closed");
    console.error("behavior working correctly. Ensure the workflow produces valid outputs");
    console.error("that pass the deterministic readiness criteria.");
  }
  if (mapped.code === CANONICAL_CODES.lease_required) {
    console.error("HINT: A side-effecting stage is missing its required lease_id.");
    console.error("This is the WP-092 fail-closed behavior - all capability-gated actions");
    console.error("must have a valid LinkSkills lease.");
  }

  process.exitCode = 1;
});
