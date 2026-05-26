import { redirect } from "next/navigation";

/** @deprecated Org scope editing lives under LiNKbrain → Org Scope. */
export default function CompanyStructurePage() {
  redirect("/memory?tab=orgScope");
}
