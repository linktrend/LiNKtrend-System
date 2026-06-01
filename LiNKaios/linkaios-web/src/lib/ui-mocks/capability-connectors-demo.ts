/** Mock capability connector catalogue rows — sourced from LiNKskills connector-registry.md for UI review. */
export type ConnectorCatalogRow = {
  id: string;
  name: string;
  capabilityScope: string;
  status: "implemented" | "declared" | "pending";
  targetSoftware: string;
  usedBy: string;
};

export const DEMO_CONNECTOR_CATALOG_ROWS: ConnectorCatalogRow[] = [
  {
    id: "odoo-crm",
    name: "Odoo CRM",
    capabilityScope: "cap.crm.odoo_shadow, crm.upsert",
    status: "implemented",
    targetSoftware: "link-odoo",
    usedBy: "All modules needing CRM records",
  },
  {
    id: "payload",
    name: "Payload CMS",
    capabilityScope: "cap.payload.local_sync",
    status: "implemented",
    targetSoftware: "LiNKsites",
    usedBy: "LinkSites",
  },
  {
    id: "plane",
    name: "Plane",
    capabilityScope: "cap.plane.execution_tracking",
    status: "implemented",
    targetSoftware: "link-plane",
    usedBy: "All modules",
  },
  {
    id: "zulip",
    name: "Zulip",
    capabilityScope: "cap.zulip.run_messaging",
    status: "implemented",
    targetSoftware: "link-zulip",
    usedBy: "All modules",
  },
  {
    id: "supabase",
    name: "Supabase",
    capabilityScope: "cap.supabase.mirror_content, cap.storage.supabase",
    status: "implemented",
    targetSoftware: "Supabase",
    usedBy: "All modules",
  },
  {
    id: "research",
    name: "Public research",
    capabilityScope: "cap.research.public_web",
    status: "implemented",
    targetSoftware: "Web search providers",
    usedBy: "All modules",
  },
  {
    id: "github",
    name: "GitHub",
    capabilityScope: "cap.github.repo_management",
    status: "declared",
    targetSoftware: "GitHub",
    usedBy: "LiNKapps, software modules",
  },
  {
    id: "stripe",
    name: "Stripe",
    capabilityScope: "cap.stripe.product_management",
    status: "declared",
    targetSoftware: "Stripe",
    usedBy: "Payment-enabled modules",
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    capabilityScope: "cap.digitalocean.deployment",
    status: "pending",
    targetSoftware: "DigitalOcean",
    usedBy: "Deployment across modules",
  },
  {
    id: "chatwoot",
    name: "Chatwoot",
    capabilityScope: "cap.chatwoot.customer_support",
    status: "pending",
    targetSoftware: "link-chatwoot",
    usedBy: "Support and CRM modules",
  },
];

export function connectorHubStats(rows: ConnectorCatalogRow[]) {
  return {
    total: rows.length,
    implemented: rows.filter((r) => r.status === "implemented").length,
    declared: rows.filter((r) => r.status === "declared").length,
    pending: rows.filter((r) => r.status === "pending").length,
  };
}
