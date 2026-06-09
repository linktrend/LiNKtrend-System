import { redirect } from "next/navigation";

/** Lifecycle controls moved to Settings → Lifecycle (finding 56). */
export default async function WorkerLifecyclePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  redirect(`/workers/${encodeURIComponent(id)}/settings#lifecycle`);
}
