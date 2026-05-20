import { redirect } from "next/navigation";

/** Module health moved to Modules hub. */
export default function CockpitModulesRedirectPage() {
  redirect("/modules");
}
