import { notFound } from "next/navigation";

import { GovernanceJsonPreview } from "@/components/governance-json-preview";
import { requireLicensorOperator } from "@/lib/licensor-access";

export const dynamic = "force-dynamic";

export default async function SettingsGovernancePage() {
  await requireLicensorOperator();

  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div>
      <GovernanceJsonPreview />
    </div>
  );
}
