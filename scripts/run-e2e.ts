import 'dotenv/config';

async function main() {
  const baseUrl = "http://localhost:3000/api/kernel";
  const authHeader = "Bearer e2e-demo-secret";
  const tenantId = "e976eb75-1aff-4ca1-ad0d-5c940c343434";
  
  console.log("1. Submitting Work Request...");
  const wrPayload = {
    plugin_id: "websitefactory",
    work_request_type: "websitefactory.lead_to_preview",
    tenant_id: tenantId,
    lead_input: {
      tenant_id: tenantId,
      source: "manual",
      business_name: "Acme Widgets",
      industry: "Manufacturing",
      contact: {
        name: "Wile E. Coyote",
        email: "wile@acme.com",
        phone: "+18005551234"
      },
      client_idempotency_key: "test-run-" + Date.now()
    }
  };

  const wrRes = await fetch(`${baseUrl}/work-request`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": authHeader
    },
    body: JSON.stringify(wrPayload)
  });
  
  if (!wrRes.ok) throw new Error(`Work Request failed: ${wrRes.status} ${await wrRes.text()}`);
  
  const wrData = await wrRes.json();
  const runId = wrData.run_id;
  console.log(`✅ Created run: ${runId}`);
  
  console.log("\n2. Executing Run Loop...");
  let runStatus = "running";
  
  while (runStatus === "running" || runStatus === "awaiting_approval") {
    const execRes = await fetch(`${baseUrl}/run/${runId}/execute`, {
      method: "POST",
      headers: { "Authorization": authHeader }
    });
    
    if (!execRes.ok) throw new Error(`Execute failed: ${execRes.status} ${await execRes.text()}`);
    
    const execData = await execRes.json();
    runStatus = execData.status;
    console.log(`⏳ Execute returned status: ${runStatus}`);
    
    if (runStatus === "awaiting_approval") {
      console.log("   Fetching pending approvals...");
      const approvalsRes = await fetch(`${baseUrl}/approvals?tenant_id=${tenantId}`, {
        headers: { "Authorization": authHeader }
      });
      const approvalsData = await approvalsRes.json();
      console.log("Approvals data:", JSON.stringify(approvalsData, null, 2));
      
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
            "Authorization": authHeader
          },
          body: JSON.stringify({ decision: "granted", reason: "E2E Demo Approval" })
        });
        if (!approveRes.ok) throw new Error(`Approval failed: ${approveRes.status} ${await approveRes.text()}`);
      }
      // Loop continues, will call execute again
    } else if (runStatus !== "running") {
      break;
    }
  }
  
  console.log(`\n✅ Run finished with status: ${runStatus}`);
  
  console.log("\n3. Trace Data:");
  const traceRes = await fetch(`${baseUrl}/run/${runId}/trace`, {
    headers: { "Authorization": authHeader }
  });
  const traceData = await traceRes.json();
  console.log(JSON.stringify(traceData, null, 2));

  console.log(`\nPreview URL: ${traceData.preview_url || 'undefined'}`);
}

main().catch(console.error);
