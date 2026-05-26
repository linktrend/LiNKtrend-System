import { GatewayDashboard } from "@/components/gateway-dashboard";
import { requireLicensorOperator } from "@/lib/licensor-access";

export const dynamic = "force-dynamic";

export default async function SettingsGatewayPage() {
  await requireLicensorOperator();

  return (
    <main>
      <GatewayDashboard />
    </main>
  );
}
