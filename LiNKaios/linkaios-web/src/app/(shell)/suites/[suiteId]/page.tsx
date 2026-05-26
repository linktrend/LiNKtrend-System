import { notFound } from "next/navigation";

import { ModuleProfileClient } from "@/components/modules/module-profile-client";
import { getPublishedSuite } from "@/lib/suites-page-copy";

export const dynamic = "force-dynamic";

function first(q: string | string[] | undefined): string | undefined {
  return Array.isArray(q) ? q[0] : q;
}

export default async function SuiteProfilePage(props: {
  params: Promise<{ suiteId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { suiteId } = await props.params;
  const searchParams = await props.searchParams;
  const tab = first(searchParams.tab);

  const suite = getPublishedSuite(suiteId);
  if (!suite) notFound();

  return <ModuleProfileClient suite={suite} initialTab={tab} />;
}
