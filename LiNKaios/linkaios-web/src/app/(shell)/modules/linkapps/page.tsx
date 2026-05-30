import { notFound } from "next/navigation";

import { ModuleProfileClient } from "@/components/suites/module-profile-client";
import { getPublishedSuite } from "@/lib/suites-page-copy";

function first(q: string | string[] | undefined): string | undefined {
  return Array.isArray(q) ? q[0] : q;
}

/** Legacy `/modules/linkapps` — canonical profile at `/suites/linkapps`. */
export default async function LegacyLinkappsSuitePage(props: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const searchParams = await props.searchParams;
  const suite = getPublishedSuite("linkapps");
  if (!suite) notFound();
  return <ModuleProfileClient suite={suite} initialTab={first(searchParams.tab)} />;
}
