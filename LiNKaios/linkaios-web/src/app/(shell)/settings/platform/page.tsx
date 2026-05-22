import { redirect } from "next/navigation";

/** Platform settings live on the Settings hub Platform tab. */
export default function SettingsPlatformPage() {
  redirect("/settings?tab=platform");
}
