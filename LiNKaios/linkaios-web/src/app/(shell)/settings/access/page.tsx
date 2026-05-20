import { redirect } from "next/navigation";

/** Merged into User → Team & permissions (UIUX-SET-002). */
export default function SettingsAccessPage() {
  redirect("/settings/user#team-permissions");
}
