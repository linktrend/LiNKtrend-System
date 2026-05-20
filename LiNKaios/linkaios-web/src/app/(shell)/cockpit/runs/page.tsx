import { redirect } from "next/navigation";

/** Cross-plane runs moved to Work (operational execution hub). */
export default function CockpitRunsRedirectPage() {
  redirect("/work");
}
