import { redirect } from "next/navigation";

export default function LegacyMyModulesPage() {
  redirect("/suites/my-suites");
}
