import { redirect } from "next/navigation";

export default function LegacySuitePricingRedirect() {
  redirect("/suites/billing");
}
