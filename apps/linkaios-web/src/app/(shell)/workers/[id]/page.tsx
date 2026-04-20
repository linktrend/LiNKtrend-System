import { redirect } from "next/navigation";

export default async function WorkerDetailRootPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  redirect(`/workers/${id}/sessions`);
}
