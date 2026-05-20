import { PrivacyDataPanel } from "./privacy-data-panel";

export const dynamic = "force-dynamic";

export default function SettingsPrivacyPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Privacy &amp; data</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        GDPR-style self-service flows for export, backup, retention, and account erasure. All actions below are{" "}
        <strong>stubbed</strong> — proof toasts and modals confirm the UX only; no backend jobs run yet.
      </p>
      <div className="mt-8">
        <PrivacyDataPanel />
      </div>
    </div>
  );
}
