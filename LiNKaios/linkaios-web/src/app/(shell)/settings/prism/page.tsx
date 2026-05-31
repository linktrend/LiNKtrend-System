import { redirect } from "next/navigation";

/** @deprecated Legacy PRISM route — use `/settings/linkguard`. */
export default function LegacySettingsPrismPage() {
  redirect("/settings/linkguard");
}
