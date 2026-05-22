import { TracesView } from "@/components/traces-view";

export const dynamic = "force-dynamic";

export default async function SettingsTracesPage(props: {
  searchParams: Promise<{ project?: string; mission?: string; event?: string }>;
}) {
  return (
    <div>
      <TracesView searchParams={props.searchParams} basePath="/settings/traces" />
    </div>
  );
}
