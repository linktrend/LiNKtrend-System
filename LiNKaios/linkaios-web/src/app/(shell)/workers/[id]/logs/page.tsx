import { redirect } from "next/navigation";

export default async function WorkerLogsRedirectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  redirect(`/workers/${encodeURIComponent(id)}/sessions#session-logs`);
}
