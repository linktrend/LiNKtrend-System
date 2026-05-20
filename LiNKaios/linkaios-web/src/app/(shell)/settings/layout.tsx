import { SettingsSubnav } from "./settings-subnav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="mt-1 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Your account, team permissions, integrations, privacy controls, and platform operator areas.
        </p>
      </header>
      <SettingsSubnav />
      <div className="min-w-0 border-t border-zinc-200 pt-8 dark:border-zinc-800">{children}</div>
    </div>
  );
}
