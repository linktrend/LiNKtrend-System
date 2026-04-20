import { notFound } from "next/navigation";

import { GovernanceJsonPreview } from "@/components/governance-json-preview";

export const dynamic = "force-dynamic";

export default async function SettingsGovernancePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900">Governance preview</h2>
      <GovernanceJsonPreview />
    </div>
  );
}
