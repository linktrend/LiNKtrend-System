import { ModulesCatalogue } from "@/components/modules-catalogue";
import { ModulesHubLayout } from "@/components/modules-hub-layout";
import type { AudienceMode } from "@/lib/ui-mocks/modules-catalog-demo";

export const dynamic = "force-dynamic";

function first(q: string | string[] | undefined): string | undefined {
  return Array.isArray(q) ? q[0] : q;
}

export default async function ModulesPage(props: {
  searchParams: Promise<{ browse?: string | string[]; audience?: string | string[]; module?: string | string[]; projectType?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const browseRaw = first(searchParams.browse);
  const audienceRaw = first(searchParams.audience);
  const moduleId = first(searchParams.module);
  const projectTypeId = first(searchParams.projectType);

  const browse = browseRaw === "project-type" ? "project-type" : "module";
  const audience: AudienceMode = audienceRaw === "vendor" ? "vendor" : "client";

  return (
    <ModulesHubLayout browse={browse} audience={audience} moduleId={moduleId} projectTypeId={projectTypeId}>
      <ModulesCatalogue browse={browse} audience={audience} moduleId={moduleId} projectTypeId={projectTypeId} />
    </ModulesHubLayout>
  );
}
