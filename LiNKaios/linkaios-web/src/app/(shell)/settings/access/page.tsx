import { Suspense } from "react";

import { PermissionsPageShell } from "@/components/settings/permissions-page-shell";

import { TeamPermissionsSection } from "./team-permissions-section";

export const dynamic = "force-dynamic";

export default function SettingsAccessPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading permissions…</p>}>
      <PermissionsPageShell
        teamPanel={
          <Suspense fallback={<p className="text-sm text-zinc-500">Loading team members…</p>}>
            <TeamPermissionsSection />
          </Suspense>
        }
      />
    </Suspense>
  );
}
