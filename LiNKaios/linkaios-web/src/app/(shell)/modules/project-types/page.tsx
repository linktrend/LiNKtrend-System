import { ModulesCatalogue } from "@/components/modules-catalogue";
import type { AudienceMode } from "@/lib/ui-mocks/modules-catalog-demo";

export const dynamic = "force-dynamic";

function first(q: string | string[] | undefined): string | undefined {
  return Array.isArray(q) ? q[0] : q;
}

export default async function ProjectTypeCataloguePage(props: {
  searchParams: Promise<{ audience?: string | string[]; projectType?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const audienceRaw = first(searchParams.audience);
  const projectTypeId = first(searchParams.projectType);
  const audience: AudienceMode = audienceRaw === "vendor" ? "vendor" : "client";

  return <ModulesCatalogue browse="project-type" audience={audience} projectTypeId={projectTypeId} />;
}
