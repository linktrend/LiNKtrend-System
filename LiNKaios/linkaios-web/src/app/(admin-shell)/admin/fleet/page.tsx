import { redirect } from "next/navigation";

import { readAppSurfaceFromHeaders, withAppBasePath } from "@/lib/app-surface";

export default async function AdminFleetRedirectPage() {
  const surface = await readAppSurfaceFromHeaders();
  redirect(withAppBasePath("/workers", surface));
}
