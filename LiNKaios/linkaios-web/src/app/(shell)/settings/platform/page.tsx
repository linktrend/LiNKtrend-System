import { redirect } from "next/navigation";

/** Platform settings live on the admin Settings hub Platform tab. */
export default function SettingsPlatformPage() {
  redirect("/admin/settings?tab=platform");
}
