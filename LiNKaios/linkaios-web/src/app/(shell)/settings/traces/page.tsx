import { TracesView } from "@/components/traces-view";

export const dynamic = "force-dynamic";

export default async function SettingsTracesPage(props: {
  searchParams: Promise<{ project?: string; mission?: string; event?: string }>;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">System logs</h2>
      <TracesView searchParams={props.searchParams} basePath="/settings/traces" />
    </div>
  );
}
