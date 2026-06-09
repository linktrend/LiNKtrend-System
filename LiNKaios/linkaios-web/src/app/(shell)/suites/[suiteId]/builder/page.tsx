import { LicensorSuiteBuilderPanel } from "@/components/admin/licensor-suite-builder-panel";

export const dynamic = "force-dynamic";

export default async function LicensorSuiteBuilderPage(props: { params: Promise<{ suiteId: string }> }) {
  const { suiteId } = await props.params;
  return <LicensorSuiteBuilderPanel suiteId={suiteId} />;
}
