/**
 * Static page help copy keyed by route (and selected query tabs).
 * TODO(GLOBAL-002+): optional LLM assistant that uses live page context — not wired yet.
 */

import { linkbrainPageTitle, linkbrainTabSubtitle } from "@/lib/linkbrain-page-copy";
import type { LinkbrainTab } from "@/lib/linkbrain-data";
import { resolveShellPageMeta } from "@/lib/shell-page-meta";

export type PageHelpContent = {
  title: string;
  paragraphs: string[];
};

function help(title: string, ...paragraphs: string[]): PageHelpContent {
  return { title, paragraphs };
}

const COMPANY_TAB_HELP: Record<string, PageHelpContent> = {
  overview: help(
    "Company — Overview",
    "Your licensed organization at a glance: legal identity, display name, industry, and who works here.",
    "Use this tab to confirm the active company profile before LiNKbots or suites rely on company context.",
  ),
  locations: help(
    "Company — Locations",
    "Physical sites for this company — headquarters, clinics, offices, or stores.",
    "Locations are separate from the organization chart; they answer “where” not “who reports to whom.”",
  ),
  organization: help(
    "Company — Organization",
    "Departments, regions, and reporting lines used to scope company knowledge in LiNKbrain.",
    "Edit structure here when you need LiNKbots and memory retrieval to respect internal hierarchy.",
  ),
  modules: help(
    "Company — Suites",
    "Subscribed product suites enabled for this company.",
    "Review what is active, what is pending, and subscription status before starting governed projects.",
  ),
  knowledge: help(
    "Company — Knowledge",
    "Approved company documents live in LiNKbrain after inbox review.",
    "Add new material through LiNKbrain Inbox; published company memory appears under LiNKbrain → Company.",
  ),
};

const SETTINGS_HELP: Record<string, PageHelpContent> = {
  "/settings/user": help(
    "Settings — User",
    "Your personal account: display name, email preferences, and sign-in context.",
    "Changes here affect only your operator identity, not tenant-wide permissions.",
  ),
  "/settings/billing": help(
    "Settings — Billing",
    "Manage payment methods, LiNKaios workspace subscription, suite licenses, and invoice history.",
    "Demo billing only — no real Stripe charges until production keys are connected.",
  ),
  "/settings/login-credentials": help(
    "Settings — Login credentials",
    "Pick one primary sign-in method: password, magic link, or passkey.",
    "Profile name and email are edited on the User page; this screen only controls authentication.",
  ),
  "/settings/two-factor": help(
    "Settings — Two-factor authentication",
    "Enable TOTP via an authenticator app and save backup codes for account recovery.",
    "Demo mode stores preferences locally; production uses Supabase Auth MFA.",
  ),
  "/settings/sessions": help(
    "Settings — Sessions & activity",
    "Review devices where you are signed in, revoke unfamiliar sessions, and inspect login history.",
    "Shows only the current operator account — not workspace-wide system traces.",
  ),
  "/settings/access": help(
    "Settings — Roles & permissions",
    "Workspace Admins assign Admin, Operator, or Viewer to human users in this client organization.",
    "LiNKbot service accounts and Linktrend vendor operators are not managed here.",
  ),
  "/settings/governance": help(
    "Settings — Governance",
    "Policies that gate LiNKbot actions, approvals, and capability usage.",
    "Review when you need stricter control over side effects such as email, publishing, or CRM writes.",
  ),
  "/settings/gateway": help(
    "Settings — Integration routing",
    "Channel and gateway routing — where inbound messages land and which LiNKbots may respond.",
    "Adjust when wiring chat, email, or other channels into the control plane.",
  ),
  "/settings/platform": help(
    "Settings — Platform",
    "Operator-level platform switches: feature flags, maintenance modes, and cross-tenant controls.",
    "Restricted to platform operators; changes can affect every tenant on this environment.",
  ),
  "/settings/advanced": help(
    "Settings — Advanced",
    "Low-level diagnostics and experimental operator tools.",
    "Open only when debugging; many controls affect live execution paths.",
  ),
  "/settings/traces": help(
    "Settings — System logs",
    "Recent trace events for debugging projects, skills, and automations.",
    "Filter by severity when investigating failures or audit gaps.",
  ),
  "/settings/tools": help(
    "Settings — Tools",
    "Tenant-wide tool registry shortcuts and operator maintenance for governed tools.",
    "Canonical catalog and certification remain under LiNKskills; this tab is for operator convenience.",
  ),
  "/settings/linkguard": help(
    "Settings — LiNKguard",
    "Worker security and cleanup policies for execution workers.",
    "Review sidecar heartbeat, residue cleanup, and guardrail status.",
  ),
  "/settings/prism": help(
    "Settings — LiNKguard",
    "Worker security and cleanup policies formerly branded PRISM Defender.",
    "Review sidecar heartbeat, residue cleanup, and guardrail status for execution workers.",
  ),
};

const EXACT: Record<string, PageHelpContent> = {
  "/": help(
    "Overview",
    "Your command-centre home: what needs attention, active projects, and quick paths into Work, Projects, and LiNKbrain.",
    "Start here each session before diving into a specific plane.",
  ),
  "/work": help(
    "Work",
    "Unified attention queue across alerts, LiNKbot sessions, and channel messages.",
    "Prioritize items that block projects or need chairman approval before opening detail pages.",
  ),
  "/work/alerts": help(
    "Work — Alerts",
    "Operational alerts derived from traces, governance, and project health.",
    "Triage critical items first; each row links to the underlying project or LiNKbot context.",
  ),
  "/work/messages": help(
    "Work — Messages",
    "Inbound and outbound channel threads grouped for operator review.",
    "Use when customers or teammates are waiting on a LiNKbot response across chat or email.",
  ),
  "/work/sessions": help(
    "Work — Sessions",
    "Active and recent LiNKbot execution sessions tied to projects.",
    "Open a session to see reasoning steps, tool calls, and whether the run is still in progress.",
  ),
  "/projects": help(
    "Projects",
    "Governed containers for live work — each project binds modules, LiNKbots, memory scope, and issues.",
    "Create projects only from enabled modules; ad-hoc phase shapes are not supported yet.",
  ),
  "/projects/new": help(
    "New project",
    "Pick a governed module so phases, template issues, and capability rules are known upfront.",
    "The module defines what LiNKautowork and LiNKbots are allowed to do for this engagement.",
  ),
  "/memory": help(
    "LiNKbrain",
    "Institutional memory for the tenant — inbox review, scoped files, and retrieval preview.",
    "Nothing becomes durable memory until inbox approval records an audit event.",
  ),
  "/skills": help(
    "LiNKskills",
    "Company catalog of skills, tools, scripts, and capabilities LiNKbots may run under lease.",
    "Certification and runtime enablement live here; execution still requires an active capability lease per action.",
  ),
  "/skills/tools": help(
    "LiNKskills — Tools",
    "Registered tools (APIs, scripts, capabilities) with runtime flags and publication state.",
    "Disable tools here when you need an immediate kill switch without deleting history.",
  ),
  "/skills/skills": help(
    "LiNKskills — Skills",
    "Packaged instructions and assets LiNKbots load for repeatable judgment work.",
    "Draft skills stay unavailable until published and, where required, certified.",
  ),
  "/skills/connectors": help(
    "LiNKskills — Capabilities",
    "Governed capabilities to external software — auth boundary, contract, and lease hooks only.",
    "Business setup inside Odoo, Plane, or CRM systems is configured in those products, not invented here.",
  ),
  "/skills/leases": help(
    "LiNKskills — Leases",
    "Active and historical capability leases granting side-effect permissions for a project or run.",
    "Every protected external action should trace back to a lease row for audit.",
  ),
  "/suites": help(
    "Suites",
    "Subscribed product suites — manage owned suites or browse the marketplace.",
    "My Suites lists subscriptions; Marketplace is where you preview and subscribe.",
  ),
  "/suites/my-suites": help(
    "My Suites",
    "Subscribed and preview suites active for your tenant.",
    "Open a suite to browse modules, projects, and outputs.",
  ),
  "/suites/marketplace": help(
    "Marketplace",
    "Suites published by Linktrend available to preview or subscribe.",
    "Demo checkout activates preview or subscription locally for MVO proof.",
  ),
  "/modules": help(
    "Suites",
    "Subscribed product suites — manage owned suites or browse the marketplace.",
    "Canonical routes live under /suites; /modules redirects for compatibility.",
  ),
  "/modules/my-modules": help(
    "My Suites",
    "Subscribed and preview suites active for your tenant.",
    "Open a suite to browse modules, projects, and outputs.",
  ),
  "/modules/marketplace": help(
    "Marketplace",
    "Suites published by Linktrend available to preview or subscribe.",
    "Demo checkout activates preview or subscription locally for MVO proof.",
  ),
  "/metrics": help(
    "Metrics",
    "Cost, tokens, latency, and success rates across projects, LiNKbots, models, tools, and skills.",
    "Use filters to find runaway spend or failing capabilities before they affect customer delivery.",
  ),
  "/cockpit": help(
    "Cockpit",
    "Cross-plane health: suite status, automation runs, and system signals.",
    "Leases and skill detail remain under LiNKskills; this view is for operational situational awareness.",
  ),
  "/cockpit/modules": help(
    "Cockpit — Modules",
    "Runtime health and activation status per tenant module.",
    "Check here when module phases are not scheduling or report degraded dependencies.",
  ),
  "/cockpit/runs": help(
    "Cockpit — Automation runs",
    "Deterministic LiNKautowork executions with status, idempotency keys, and audit linkage.",
    "Contrast with LiNKbot sessions when you need repeatable automation rather than reasoning.",
  ),
  "/cockpit/leases": help(
    "Cockpit — Leases",
    "Shortcut to in-flight capability leases across the tenant.",
    "Revoke or inspect leases when a capability misbehaves or a project must be frozen.",
  ),
  "/company": COMPANY_TAB_HELP.overview!,
  "/workers": help(
    "LiNKbots",
    "Directory of role-bound AI workers — registry status, presence, and project assignments.",
    "Add or open a LiNKbot to configure models, skills, sessions, and communication profiles.",
  ),
  "/workers/new": help(
    "New LiNKbot",
    "Register a new role-bound worker with runtime adapter and project profile.",
    "Choose the role carefully — it determines default skills, channels, and governance envelopes.",
  ),
  "/traces": help(
    "System logs",
    "Recent trace and audit events for debugging across planes.",
    "Correlate timestamps with project IDs when escalating production incidents.",
  ),
  "/gateway": help(
    "Integration routing",
    "Configure how inbound channels route to LiNKbots and suites.",
    "Misconfigured routing is a common cause of silent message loss.",
  ),
  ...SETTINGS_HELP,
};

const PREFIX: { prefix: string; content: PageHelpContent }[] = [
  {
    prefix: "/settings/",
    content: help(
      "Settings",
      "Account, access, governance, integrations, and platform operator controls.",
      "Pick a section from the left nav; each tab scopes changes to that concern only.",
    ),
  },
  {
    prefix: "/memory/",
    content: help(
      "LiNKbrain",
      "Memory files, drafts, and scoped retrieval for this area.",
      "Drafts and uploads flow through inbox approval before they affect retrieval.",
    ),
  },
  {
    prefix: "/skills/",
    content: help(
      "LiNKskills",
      "Skills, tools, scripts, and certification for governed execution.",
      "Open the hub sections for catalog tables; detail routes edit a single artifact.",
    ),
  },
  {
    prefix: "/suites/",
    content: help(
      "Suites",
      "Suite-specific module catalogue, projects, and sample outputs.",
      "Return to My Suites to switch subscribed products.",
    ),
  },
  {
    prefix: "/modules/",
    content: help(
      "Suites",
      "Suite-specific module catalogue, projects, and sample outputs.",
      "Return to My Suites to switch subscribed products.",
    ),
  },
  {
    prefix: "/projects/",
    content: help(
      "Project",
      "Single governed project: phases, issues, memory scope, and LiNKbot assignments.",
      "Use the project header actions for refresh; trace links appear when runs emit events.",
    ),
  },
  {
    prefix: "/workers/",
    content: help(
      "LiNKbot",
      "Individual worker: sessions, skills, models, brain scope, and settings.",
      "Changes to runtime adapters may require restarting active sessions.",
    ),
  },
  {
    prefix: "/cockpit/",
    content: help(
      "Cockpit",
      "Cross-plane operations — suite health, automation runs, and lease shortcuts.",
    ),
  },
];

function linkbrainTabHelp(tab: string | null): PageHelpContent | null {
  const normalized = tab === "missions" ? "project" : tab === "sandbox" ? "ask" : tab;
  const valid: LinkbrainTab[] = ["inbox", "project", "agent", "company", "ask", "audit", "orgScope"];
  if (!normalized || !valid.includes(normalized as LinkbrainTab)) return null;
  const t = normalized as LinkbrainTab;
  return help(
    linkbrainPageTitle(t),
    linkbrainTabSubtitle(t),
    "Static help only for now — a contextual assistant may summarize live inbox counts later.",
  );
}

export function resolvePageHelp(
  pathname: string,
  searchParams?: URLSearchParams | { get(name: string): string | null } | null,
): PageHelpContent {
  const tab = searchParams?.get("tab") ?? null;

  if (pathname === "/company" || pathname.startsWith("/company")) {
    const key = tab && COMPANY_TAB_HELP[tab] ? tab : "overview";
    return COMPANY_TAB_HELP[key]!;
  }

  if (pathname === "/memory") {
    const brain = linkbrainTabHelp(tab);
    if (brain) return brain;
  }

  const exact = EXACT[pathname];
  if (exact) return exact;

  for (const row of PREFIX) {
    if (pathname.startsWith(row.prefix)) return row.content;
  }

  const meta = resolveShellPageMeta(pathname);
  if (meta) {
    return help(meta.title, meta.subtitle, "This page is part of the LiNKaios operator shell — use Refresh to reload server data.");
  }

  const leaf = pathname.split("/").filter(Boolean).pop() ?? "Page";
  const title = leaf.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return help(
    title,
    `${title} in LiNKaios — static help has no dedicated copy for this path yet.`,
    "TODO: add route-specific help in page-help-copy.ts or extend shell-page-meta.",
  );
}
