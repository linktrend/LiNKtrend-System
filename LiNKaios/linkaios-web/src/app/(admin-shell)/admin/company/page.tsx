import { redirect } from "next/navigation";

import { ADMIN_BASE_PATH } from "@/lib/app-surface";
import { LICENSEES_HUB_PATH } from "@/lib/company-page-copy";

/** Legacy licensor route — canonical path is `/admin/licensees`. */
export default function AdminCompanyLegacyRedirectPage() {
  redirect(`${ADMIN_BASE_PATH}${LICENSEES_HUB_PATH}`);
}
