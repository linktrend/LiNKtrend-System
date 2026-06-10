#!/usr/bin/env node
/**
 * Ops helper: pull Chatwoot conversations into linkaios.support_tickets via service role.
 * Usage on VPS:
 *   source /opt/linktrend/runtime/linkaios/prod.env.runtime
 *   node scripts/run-chatwoot-support-sync.mjs
 */
import http from "node:http";

const env = process.env;
const baseUrl = (env.CHATWOOT_BASE_URL ?? "").replace(/\/+$/, "");
const accountId = env.CHATWOOT_ACCOUNT_ID;
const inboxId = env.CHATWOOT_INBOX_ID;
const token = env.CHATWOOT_API_ACCESS_TOKEN;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SECRET_KEY;

for (const [name, value] of Object.entries({
  CHATWOOT_BASE_URL: baseUrl,
  CHATWOOT_ACCOUNT_ID: accountId,
  CHATWOOT_INBOX_ID: inboxId,
  CHATWOOT_API_ACCESS_TOKEN: token,
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  SUPABASE_SECRET_KEY: serviceKey,
})) {
  if (!value) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
}

function chatwootGet(path) {
  return new Promise((resolve, reject) => {
    const target = new URL(path, `${baseUrl}/`);
    const req = http.request(
      {
        hostname: target.hostname,
        port: target.port || 80,
        path: `${target.pathname}${target.search}`,
        method: "GET",
        headers: { api_access_token: token },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          if ((res.statusCode ?? 500) < 200 || (res.statusCode ?? 500) >= 300) {
            reject(new Error(`Chatwoot ${res.statusCode}: ${text.slice(0, 200)}`));
            return;
          }
          resolve(JSON.parse(text || "{}"));
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function supabaseJson(method, path, body) {
  const res = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      "Accept-Profile": "linkaios",
      "Content-Profile": "linkaios",
      Prefer: method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase ${res.statusCode}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

function mapStatus(status) {
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "resolved") return "resolved";
  if (normalized === "pending" || normalized === "snoozed") return "in_progress";
  return "open";
}

const readiness = await chatwootGet(`/api/v1/accounts/${accountId}`);
console.log("Chatwoot account:", readiness.name ?? accountId);

const list = await chatwootGet(
  `/api/v1/accounts/${accountId}/conversations?inbox_id=${inboxId}&status=all&page=1`,
);
const rows = list.payload ?? list.data?.payload ?? [];
console.log(`Found ${rows.length} conversation(s)`);

let synced = 0;
for (const row of rows) {
  const externalRef = String(row.id);
  const subject =
    (typeof row.custom_attributes?.subject === "string" && row.custom_attributes.subject.trim()) ||
    row.messages?.[0]?.content?.split("\n")[0]?.trim()?.slice(0, 160) ||
    `Chatwoot conversation #${externalRef}`;
  const description = row.messages?.[0]?.content?.trim() || "Synced from Chatwoot.";
  const licenseeId =
    (typeof row.custom_attributes?.licensee_id === "string" && row.custom_attributes.licensee_id.trim()) ||
    "unknown-licensee";
  const pagePath =
    (typeof row.custom_attributes?.page_path === "string" && row.custom_attributes.page_path.trim()) ||
    "/customer-service";
  const now = new Date().toISOString();
  const payload = {
    licensee_id: licenseeId,
    company_id: null,
    brand_id: null,
    subject,
    description,
    page_path: pagePath,
    status: mapStatus(row.status),
    priority: "normal",
    source: "chatwoot_sync",
    requested_by: row.meta?.sender?.name?.trim() || row.meta?.sender?.email?.trim() || "Chatwoot contact",
    external_ref: externalRef,
    ai_attempt_summary: null,
    updated_at: now,
  };

  const existing = await supabaseJson(
    "GET",
    `/rest/v1/support_tickets?external_ref=eq.${encodeURIComponent(externalRef)}&select=id&limit=1`,
  );

  if (Array.isArray(existing) && existing[0]?.id) {
    await supabaseJson("PATCH", `/rest/v1/support_tickets?id=eq.${existing[0].id}`, payload);
  } else {
    await supabaseJson("POST", "/rest/v1/support_tickets", {
      ...payload,
      created_at: row.created_at ? new Date(row.created_at * 1000).toISOString() : now,
    });
  }
  synced += 1;
  console.log(`synced conversation ${externalRef} (${licenseeId})`);
}

console.log(`Done. synced=${synced}`);
