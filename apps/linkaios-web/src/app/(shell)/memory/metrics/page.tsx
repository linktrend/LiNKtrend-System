import { redirect } from "next/navigation";

export default function LegacyMemoryMetricsRedirect() {
  redirect("/metrics");
}
