import { Suspense } from "react";

import { LicensorPermissionsPageShell } from "@/components/admin/licensor-permissions-page-shell";
import { LicensorTeamPermissionsSection } from "@/components/admin/licensor-team-permissions-section";

export const dynamic = "force-dynamic";

export default function AdminSettingsAccessPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading permissions…</p>}>
      <LicensorPermissionsPageShell teamPanel={<LicensorTeamPermissionsSection />} />
    </Suspense>
  );
}
