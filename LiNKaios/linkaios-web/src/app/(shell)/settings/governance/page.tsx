import { notFound } from "next/navigation";

import { GovernanceJsonPreview } from "@/components/governance-json-preview";

export const dynamic = "force-dynamic";

export default async function SettingsGovernancePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div>
      <GovernanceJsonPreview />
    </div>
  );
}
