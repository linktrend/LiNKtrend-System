import { redirect } from "next/navigation";

/** Renamed to Platform in UI (UIUX-SET-005). */
export default function SettingsAdvancedPage() {
  redirect("/settings/platform");
}
