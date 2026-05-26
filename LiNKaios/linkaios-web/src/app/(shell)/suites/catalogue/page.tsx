import { redirect } from "next/navigation";

export default function LegacySuiteCatalogueRedirect() {
  redirect("/suites");
}
