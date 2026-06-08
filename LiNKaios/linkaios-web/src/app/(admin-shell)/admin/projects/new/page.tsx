import { redirect } from "next/navigation";

import { ADMIN_BASE_PATH } from "@/lib/app-surface";

/** Block Client project wizard bleed on Admin — licensee project creation is Client-only. */
export default function AdminProjectsNewBlockedPage() {
  redirect(`${ADMIN_BASE_PATH}/projects?blocked=create`);
}
