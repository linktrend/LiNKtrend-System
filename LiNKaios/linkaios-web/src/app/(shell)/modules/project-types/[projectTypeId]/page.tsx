import { redirect } from "next/navigation";

import { MODULES_CATALOG_DEMO } from "@/lib/ui-mocks/modules-catalog-demo";

export default async function LegacyModulesProjectTypePage(props: { params: Promise<{ projectTypeId: string }> }) {
  const { projectTypeId } = await props.params;
  const process = MODULES_CATALOG_DEMO.processes.find((p) => p.id === projectTypeId);
  if (process) {
    redirect(`/suites/${process.moduleId}?tab=modules`);
  }
  redirect("/suites/my-suites");
}
