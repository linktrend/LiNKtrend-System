"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Bell,
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

import { DeleteAccountCard } from "@/components/settings/delete-account-card";
import { SettingCard, SettingCardFacts } from "@/components/settings/setting-card";
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
  SETTINGS_HUB_TABS,
  parseSettingsHubTab,
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

function ApiKeysSummaryLine() {
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
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = parseSettingsHubTab(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState<SettingsHubTabId>(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

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
      router.replace(qs ? `/settings?${qs}` : "/settings", { scroll: false });
    },
    [router, searchParams],
  );

  const tabs = SETTINGS_HUB_TABS;

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SettingCard
            icon={User}
            title="Profile Information"
            description="Your operator identity and sign-in email."
            actionLabel="Edit Profile"
            href="/settings/user"
          >
            <ProfileInformationSummary
              email={props.operatorEmail}
              displayName={props.operatorDisplayName}
              avatarUrl={props.operatorAvatarUrl}
            />
          </SettingCard>

          <SettingCard
            icon={CreditCard}
            title="Plan & Billing"
            description="Current plan and billing information."
            actionLabel="Manage Billing"
            href="/settings/billing"
          >
            <PlanBillingSummary />
          </SettingCard>

          <DeleteAccountCard />
        </div>
      ) : null}

      {activeTab === "security" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SettingCard
            icon={Lock}
            title="Login Credentials"
            description="Choose password, magic link, or passkey — one active sign-in method at a time."
            actionLabel="Manage sign-in"
            href="/settings/login-credentials"
          />

          <SettingCard
            icon={Shield}
            title="Two-Factor Authentication"
            description="Add an extra verification step at sign-in."
            actionLabel="Manage 2FA"
            href="/settings/two-factor"
          >
            <TwoFactorStatusLine />
          </SettingCard>

          <SettingCard
            icon={Key}
            title="User Roles & Permissions"
            description="Workspace Admins assign Admin, Operator, or Viewer roles to client users."
            actionLabel="Manage permissions"
            href="/settings/access"
          />

          <SettingCard
            icon={FileText}
            title="Session & Activity Logs"
            description="Your sign-in sessions, devices, locations, and security activity history."
            actionLabel="View sessions & activity"
            href="/settings/sessions"
          />
        </div>
      ) : null}

      {activeTab === "preferences" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SettingCard
            icon={Globe}
            title="Locale"
            description="Language and regional formatting."
            actionLabel="Manage Locale Settings"
            href="/settings/locale"
          />

          <SettingCard
            icon={Palette}
            title="Theme & Appearance"
            description="Light, dark, or system appearance."
            actionLabel="Customize Appearance"
            href="/settings/appearance"
          />

          <SettingCard
            icon={Bell}
            title="Notification Preferences"
            description="Email and in-app notification toggles."
            actionLabel="Manage Notifications"
            href="/settings/notifications"
          />

          <SettingCard
            icon={Eye}
            title="Privacy Settings"
            description="Data sharing and analytics tracking."
            actionLabel="Manage Privacy"
            href="/settings/privacy"
          />
        </div>
      ) : null}

      {activeTab === "data" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SettingCard
            icon={Upload}
            title="Data Export"
            description="Export a portable copy of your workspace data."
            actionLabel="Export Data"
            href="/settings/data-export"
          >
            <DataExportSummary />
          </SettingCard>

          <SettingCard
            icon={Database}
            title="Data Settings"
            description="Data retention policy, backup and restore settings."
            actionLabel="Manage Data Settings"
            href="/settings/data-settings"
          >
            <DataSettingsSummary />
          </SettingCard>

          <SettingCard
            icon={Link2}
            title="Integrations"
            description="Request capabilities for software not yet supported in LiNKaios."
            actionLabel="Manage Integrations"
            href="/settings/integrations"
          >
            <IntegrationsSummary />
          </SettingCard>

          <SettingCard
            icon={Key}
            title="API Access"
            description="Add API keys and secrets from external providers — LLMs, banks, CRMs, and other software LiNKaios connects to."
            actionLabel="Manage credentials"
            href="/settings/api-keys"
          >
            <ApiKeysSummaryLine />
          </SettingCard>
        </div>
      ) : null}

      {activeTab === "platform" ? props.platformPanel : null}
    </div>
  );
}
