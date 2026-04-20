import { GatewayDashboard } from "@/components/gateway-dashboard";

export const dynamic = "force-dynamic";

export default function SettingsGatewayPage() {
  return (
    <main>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Integration routing</h2>
      <GatewayDashboard />
    </main>
  );
}
