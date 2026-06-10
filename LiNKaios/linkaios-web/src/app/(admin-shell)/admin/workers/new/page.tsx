import { redirect } from "next/navigation";

import { readAppSurfaceFromHeaders, withAppBasePath } from "@/lib/app-surface";

export default async function AdminWorkersNewRedirectPage() {
  const surface = await readAppSurfaceFromHeaders();
  redirect(withAppBasePath("/suites", surface));
}
