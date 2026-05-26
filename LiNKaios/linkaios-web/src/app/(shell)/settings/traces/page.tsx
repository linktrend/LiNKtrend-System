import { TracesView } from "@/components/traces-view";
import { requireLicensorOperator } from "@/lib/licensor-access";

export const dynamic = "force-dynamic";

export default async function SettingsTracesPage(props: {
  searchParams: Promise<{ project?: string; mission?: string; event?: string }>;
}) {
  await requireLicensorOperator();

  return (
    <div>
      <TracesView searchParams={props.searchParams} basePath="/settings/traces" />
    </div>
  );
}
