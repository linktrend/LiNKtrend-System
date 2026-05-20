/**
 * Legacy App Factory dashboard path — unified with module catalogue drill-down.
 * `/modules/linkapps` now resolves to the LiNKapps module hub (same as `/modules/[moduleId]`).
 */

import ModuleDetailPage from "../[moduleId]/page";

export const dynamic = "force-dynamic";

export default async function LinkappsUnifiedModulePage(props: {
  searchParams: Promise<{ audience?: string | string[] }>;
}) {
  return ModuleDetailPage({
    params: Promise.resolve({ moduleId: "linkapps" }),
    searchParams: props.searchParams,
  });
}
