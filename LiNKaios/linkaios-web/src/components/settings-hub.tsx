"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Bell,
  Headphones,
  CreditCard,
  Database,
  Eye,
  FileText,
  Globe,
  Key,
  Link2,
  Lock,
  Palette,
  Shield,
  Upload,
  User,
} from "lucide-react";

import { useAppRole } from "@/components/role-preview-provider";
import { canManageBilling, canDeleteWorkspaceAccount } from "@/lib/app-roles";
import { DeleteAccountCard } from "@/components/settings/delete-account-card";
import { SettingCard, SettingCardFacts } from "@/components/settings/setting-card";
import { StubBadge } from "@/components/stub-badge";
import { useAppSurface } from "@/components/app-surface-provider";
import { modulesForCompany, resolveCompanyFixture } from "@/lib/company-fixtures";
import { operatorFullName, readOperatorProfile, type OperatorProfile } from "@/lib/operator-profile";
import {
  EVENT_DATA_EXPORT_CHANGED,
  readExportRequests,
  type ExportRequestRow,
} from "@/lib/data-export-preferences";
import {
  EVENT_DATA_SETTINGS_CHANGED,
  readDataSettings,
  retentionLabel,
} from "@/lib/data-settings-preferences";
import {
  EVENT_INTEGRATION_REQUESTS_CHANGED,
  readIntegrationRequests,
  SUPPORTED_INTEGRATIONS,
} from "@/lib/integration-requests";
import {
  VAULTWARDEN_REPO,
  VAULTWARDEN_SECRETS_COPY,
  vaultwardenPublicUrl,
} from "@/lib/vaultwarden-config";
import {
  EVENT_SUPPORT_TICKETS_CHANGED,
  readSupportTicketsForLicensee,
  SUPPORT_BACKEND_LABEL,
  SUPPORT_BACKEND_REPO,
} from "@/lib/support-tickets";
import { resolveLicenseeIdForCompany } from "@/lib/licensor-licensee-profile";
import {
  SETTINGS_HUB_TABS,
  parseSettingsHubTab,
  visibleSettingsHubTabs,
  type SettingsHubTabId,
} from "@/lib/settings-hub-tabs";
import { EVENT_2FA_CHANGED, readTwoFactorState } from "@/lib/two-factor-copy";
import { BILLING_DEMO_LINKAIOS_PLAN } from "@/lib/ui-mocks/billing-demo";
import { screenTabLinkClass } from "@/lib/ui-standards";

function StatusBadge(props: { label: string; tone: "red" | "green" | "gray" }) {
  const toneClass =
    props.tone === "green"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : props.tone === "red"
        ? "bg-red-500/15 text-red-600 dark:text-red-300"
        : "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300";
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>{props.label}</span>;
}

function TwoFactorStatusLine() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(readTwoFactorState().enabled);
    sync();
    window.addEventListener(EVENT_2FA_CHANGED, sync);
    return () => window.removeEventListener(EVENT_2FA_CHANGED, sync);
  }, []);

  return (
    <SettingCardFacts
      rows={[
        {
          label: "Status",
          value: <StatusBadge label={enabled ? "Enabled" : "Disabled"} tone={enabled ? "green" : "red"} />,
        },
      ]}
    />
  );
}

function ProfileInformationSummary(props: {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}) {
  const [profile, setProfile] = useState<OperatorProfile | null>(null);

  useEffect(() => {
    const seed = { email: props.email, displayName: props.displayName, avatarUrl: props.avatarUrl };
    const sync = () => setProfile(readOperatorProfile(seed));
    sync();
    window.addEventListener("linkaios-operator-profile", sync);
    return () => window.removeEventListener("linkaios-operator-profile", sync);
  }, [props.avatarUrl, props.displayName, props.email]);

  const name = profile ? operatorFullName(profile) : props.displayName?.trim() || props.email.split("@")[0] || "Operator";
  const email = profile?.email ?? props.email;

  return (
    <SettingCardFacts
      rows={[
        { label: "Name", value: name, strong: true },
        { label: "Email", value: email },
      ]}
    />
  );
}

function PlanBillingSummary() {
  const searchParams = useSearchParams();
  const company = resolveCompanyFixture(searchParams.get("companyId"));
  const subscribedCount = useMemo(
    () => modulesForCompany(company.id).filter((row) => row.status === "active" || row.status === "trialing").length,
    [company.id],
  );
  const planName = BILLING_DEMO_LINKAIOS_PLAN.name.replace(/^LiNKaios\s+/i, "");

  return (
    <SettingCardFacts
      rows={[
        { label: "Plan", value: planName, strong: true },
        { label: "Suites", value: `${subscribedCount} subscribed` },
      ]}
    />
  );
}

function DataExportSummary() {
  const [rows, setRows] = useState<ExportRequestRow[]>(() => readExportRequests());

  useEffect(() => {
    const sync = () => setRows(readExportRequests());
    sync();
    window.addEventListener(EVENT_DATA_EXPORT_CHANGED, sync);
    return () => window.removeEventListener(EVENT_DATA_EXPORT_CHANGED, sync);
  }, []);

  const latest = rows[0];
  if (!latest) {
    return <SettingCardFacts rows={[{ label: "Last export", value: "none yet" }]} />;
  }

  const date = latest.requestedAt.replace("T", " ").slice(0, 16);
  return <SettingCardFacts rows={[{ label: "Last export", value: `${latest.status} (${date})` }]} />;
}

function DataSettingsSummary() {
  const [prefs, setPrefs] = useState(() => readDataSettings());

  useEffect(() => {
    const sync = () => setPrefs(readDataSettings());
    sync();
    window.addEventListener(EVENT_DATA_SETTINGS_CHANGED, sync);
    return () => window.removeEventListener(EVENT_DATA_SETTINGS_CHANGED, sync);
  }, []);

  return (
    <SettingCardFacts
      rows={[
        { label: "Events", value: retentionLabel(prefs.eventRetentionDays) },
        { label: "Backups", value: prefs.automaticBackups ? prefs.backupFrequency : "manual only" },
      ]}
    />
  );
}

function IntegrationsSummary() {
  const [rows, setRows] = useState(() => readIntegrationRequests());

  useEffect(() => {
    const sync = () => setRows(readIntegrationRequests());
    sync();
    window.addEventListener(EVENT_INTEGRATION_REQUESTS_CHANGED, sync);
    return () => window.removeEventListener(EVENT_INTEGRATION_REQUESTS_CHANGED, sync);
  }, []);

  const open = rows.filter((row) => row.status === "submitted" || row.status === "under_review").length;

  return (
    <SettingCardFacts
      rows={[
        { label: "Requests", value: open > 0 ? `${open} open` : "none open" },
        { label: "Supported", value: `${SUPPORTED_INTEGRATIONS.length} capabilities` },
      ]}
    />
  );
}

function SupportSummary() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const licenseeId = resolveLicenseeIdForCompany(companyId ?? "xyz-marketing");
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      const open = readSupportTicketsForLicensee(licenseeId).filter((t) => t.status !== "resolved").length;
      setOpenCount(open);
    };
    sync();
    window.addEventListener(EVENT_SUPPORT_TICKETS_CHANGED, sync);
    return () => window.removeEventListener(EVENT_SUPPORT_TICKETS_CHANGED, sync);
  }, [licenseeId]);

  return (
    <SettingCardFacts
      rows={[
        { label: "Open tickets", value: openCount > 0 ? `${openCount} open` : "none open" },
        { label: "Backend", value: `${SUPPORT_BACKEND_LABEL} (${SUPPORT_BACKEND_REPO})` },
      ]}
    />
  );
}

function ApiKeysSummaryLine(props: { licensor?: boolean }) {
  if (props.licensor) {
    return (
      <SettingCardFacts
        rows={[
          { label: "Store", value: VAULTWARDEN_REPO },
          { label: "Examples", value: "LLM · Stripe · database" },
        ]}
      />
    );
  }
  return (
    <SettingCardFacts
      rows={[
        { label: "Scope", value: "External providers" },
        { label: "Examples", value: "LLM · bank · CRM" },
      ]}
    />
  );
}

/** Settings hub — tab strip and cards match Modules / LiNKskills hub patterns. */
export function SettingsHub(props: {
  platformPanel: React.ReactNode;
  operatorEmail: string;
  operatorDisplayName?: string | null;
  operatorAvatarUrl?: string | null;
  showPlatformTab?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin, href: appHref } = useAppSurface();
  const { role, kind } = useAppRole();
  const showPlatformTab = props.showPlatformTab === true || isAdmin;
  const showBilling = kind === "licensee" && canManageBilling(kind, role);
  const showDeleteAccount = canDeleteWorkspaceAccount(kind, role);
  const tabFromUrl = parseSettingsHubTab(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState<SettingsHubTabId>(tabFromUrl);

  useEffect(() => {
    if (!showPlatformTab && tabFromUrl === "platform") {
      router.replace(appHref("/settings"), { scroll: false });
      setActiveTab("account");
      return;
    }
    setActiveTab(tabFromUrl);
  }, [tabFromUrl, showPlatformTab, router]);

  const selectTab = useCallback(
    (tab: SettingsHubTabId) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "account") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const qs = params.toString();
      router.replace(appHref(qs ? `/settings?${qs}` : "/settings"), { scroll: false });
    },
    [router, searchParams],
  );

  const tabs = visibleSettingsHubTabs(showPlatformTab, role);

  return (
    <div className="space-y-6">
      <nav aria-label="Settings categories" className="min-w-0 overflow-x-auto pb-px [-webkit-overflow-scrolling:touch]">
        <div className="flex w-max min-w-full flex-nowrap items-end gap-1 border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => selectTab(tab.id)}
              className={screenTabLinkClass(activeTab === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === "account" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SettingCard
            icon={User}
            title="Profile Information"
            description="Your operator identity and sign-in email."
            actionLabel="Edit Profile"
            href={appHref("/settings/user")}
          >
            <ProfileInformationSummary
              email={props.operatorEmail}
              displayName={props.operatorDisplayName}
              avatarUrl={props.operatorAvatarUrl}
            />
          </SettingCard>

          {showBilling ? (
            <SettingCard
              icon={CreditCard}
              title="Plan & Billing"
              description="Current plan and billing information."
              actionLabel="Manage Billing"
              href={appHref("/settings/billing")}
              titleAction={<StubBadge />}
            >
              <PlanBillingSummary />
            </SettingCard>
          ) : null}

          {kind === "licensee" ? (
            <SettingCard
              icon={Headphones}
              title="Support"
              description="Ticket history and escalation when page help cannot resolve your issue."
              actionLabel="View support"
              href={appHref("/settings/support")}
            >
              <SupportSummary />
            </SettingCard>
          ) : null}

          {showDeleteAccount ? <DeleteAccountCard /> : null}
        </div>
      ) : null}

      {activeTab === "security" ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <SettingCard
              icon={Lock}
              title="Login Credentials"
              description="Choose password, magic link, or passkey — one active sign-in method at a time."
              actionLabel="Manage sign-in"
              href={appHref("/settings/login-credentials")}
            />

            <SettingCard
              icon={Shield}
              title="Two-Factor Authentication"
              description="Add an extra verification step at sign-in."
              actionLabel="Manage 2FA"
              href={appHref("/settings/two-factor")}
            >
              <TwoFactorStatusLine />
            </SettingCard>

            {kind === "licensee" ? (
              <SettingCard
                icon={Key}
                title="User Roles & Permissions"
                description="Workspace Admins assign Admin, Operator, or Viewer roles to client users."
                actionLabel="Manage permissions"
                href={appHref("/settings/access")}
              />
            ) : (
              <SettingCard
                icon={Key}
                title="Operator Roles & Permissions"
                description="LiNKtrend staff who can access the Admin app — User, Admin, and Super Admin platform tiers."
                actionLabel="Manage permissions"
                href={appHref("/settings/access")}
              />
            )}

            <SettingCard
              icon={FileText}
              title="Session & Activity Logs"
              description="Your sign-in sessions, devices, locations, and security activity history."
              actionLabel="View sessions & activity"
              href={appHref("/settings/sessions")}
            />
          </div>
        </div>
      ) : null}

      {activeTab === "preferences" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SettingCard
            icon={Globe}
            title="Locale"
            description="Language and regional formatting."
            actionLabel="Manage Locale Settings"
            href={appHref("/settings/locale")}
          />

          <SettingCard
            icon={Palette}
            title="Theme & Appearance"
            description="Light, dark, or system appearance."
            actionLabel="Customize Appearance"
            href={appHref("/settings/appearance")}
          />

          <SettingCard
            icon={Bell}
            title="Notification Preferences"
            description="Email and in-app notification toggles."
            actionLabel="Manage Notifications"
            href={appHref("/settings/notifications")}
          />

          <SettingCard
            icon={Eye}
            title="Privacy Settings"
            description="Data sharing and analytics tracking."
            actionLabel="Manage Privacy"
            href={appHref("/settings/privacy")}
          />
        </div>
      ) : null}

      {activeTab === "data" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SettingCard
            icon={Upload}
            title="Data Export"
            description={
              kind === "licensor"
                ? "Export platform audit bundles and licensor registry snapshots for compliance and disaster recovery."
                : "Export a portable copy of your workspace data."
            }
            actionLabel="Export Data"
            href={appHref("/settings/data-export")}
            titleAction={<StubBadge />}
          >
            <DataExportSummary />
          </SettingCard>

          <SettingCard
            icon={Database}
            title="Data Settings"
            description={
              kind === "licensor"
                ? "Platform-wide retention, backup schedules, and restore policies for LiNKaios operator data."
                : "Data retention policy, backup and restore settings."
            }
            actionLabel="Manage Data Settings"
            href={appHref("/settings/data-settings")}
            titleAction={<StubBadge />}
          >
            <DataSettingsSummary />
          </SettingCard>

          {kind === "licensee" ? (
            <SettingCard
              icon={Link2}
              title="Integrations"
              description="Request capabilities for software not yet supported in LiNKaios."
              actionLabel="Manage Integrations"
              href={appHref("/settings/integrations")}
              titleAction={<StubBadge />}
            >
              <IntegrationsSummary />
            </SettingCard>
          ) : null}

          <SettingCard
            icon={Key}
            title={kind === "licensor" ? VAULTWARDEN_SECRETS_COPY.title : "API Access"}
            description={
              kind === "licensor"
                ? VAULTWARDEN_SECRETS_COPY.cardDescription
                : "Add API keys and secrets from external providers — LLMs, banks, CRMs, and other software LiNKaios connects to."
            }
            actionLabel={kind === "licensor" ? VAULTWARDEN_SECRETS_COPY.openAction : "Manage credentials"}
            href={
              kind === "licensor"
                ? vaultwardenPublicUrl() || appHref("/settings/api-keys")
                : appHref("/settings/api-keys")
            }
            external={kind === "licensor" && Boolean(vaultwardenPublicUrl())}
          >
            <ApiKeysSummaryLine licensor={kind === "licensor"} />
          </SettingCard>
        </div>
      ) : null}

      {activeTab === "platform" ? props.platformPanel : null}
    </div>
  );
}
