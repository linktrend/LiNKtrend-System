import { redirect } from "next/navigation";

/** Legacy `/cockpit` — LiNKaios Client overview. */
export default function CockpitRedirectPage() {
  redirect("/client");
}
