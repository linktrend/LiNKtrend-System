import { redirect } from "next/navigation";

/** Renamed to Platform in UI (UIUX-SET-005). Licensor-only — use admin surface. */
export default function SettingsAdvancedPage() {
  redirect("/admin/settings?tab=platform");
}
