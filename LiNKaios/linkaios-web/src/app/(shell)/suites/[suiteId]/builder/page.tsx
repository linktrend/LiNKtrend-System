import { notFound } from "next/navigation";

import { LicensorSuiteBuilderPanel } from "@/components/admin/licensor-suite-builder-panel";
import { resolveLicensorSuiteProduct } from "@/lib/ui-mocks/licensor-suite-catalog";

export const dynamic = "force-dynamic";

export default async function LicensorSuiteBuilderPage(props: { params: Promise<{ suiteId: string }> }) {
  const { suiteId } = await props.params;
  const suite = resolveLicensorSuiteProduct(suiteId);

  if (!suite) {
    notFound();
  }

  return <LicensorSuiteBuilderPanel suite={suite} />;
}
