import { redirect } from "next/navigation";

/** @deprecated Use `/settings/access`. */
export default function AdminAccessRedirectPage() {
  redirect("/settings/access");
}
