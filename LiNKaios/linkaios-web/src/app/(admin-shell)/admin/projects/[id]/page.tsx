import { redirect } from "next/navigation";

import { ADMIN_BASE_PATH } from "@/lib/app-surface";

/** Block Client project detail bleed on Admin — tenant project detail is Client-only. */
export default function AdminProjectDetailBlockedPage() {
  redirect(`${ADMIN_BASE_PATH}/projects?blocked=detail`);
}
