import { ModulesCatalogue } from "@/components/modules-catalogue";
import { ModulesHubLayout } from "@/components/modules-hub-layout";
import type { AudienceMode } from "@/lib/ui-mocks/modules-catalog-demo";

export const dynamic = "force-dynamic";

function first(q: string | string[] | undefined): string | undefined {
  return Array.isArray(q) ? q[0] : q;
}

export default async function ModuleDetailPage(props: {
  params: Promise<{ moduleId: string }>;
  searchParams: Promise<{ audience?: string | string[] }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const audienceRaw = first(searchParams.audience);
  const audience: AudienceMode = audienceRaw === "vendor" ? "vendor" : "client";

  return (
    <ModulesHubLayout browse="module" audience={audience} moduleId={params.moduleId}>
      <ModulesCatalogue browse="module" audience={audience} moduleId={params.moduleId} />
    </ModulesHubLayout>
  );
}
