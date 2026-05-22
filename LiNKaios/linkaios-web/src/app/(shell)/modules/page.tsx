import { redirect } from "next/navigation";

/** Legacy `/modules/*` — canonical routes live under `/suites/*`. */
export default function LegacyModulesIndexPage() {
  redirect("/suites/my-suites");
}
