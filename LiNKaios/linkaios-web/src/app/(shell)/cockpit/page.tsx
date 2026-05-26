import { redirect } from "next/navigation";

/** Cockpit retired — cross-plane summary lives on Overview. */
export default function CockpitRedirectPage() {
  redirect("/app");
}
