
import { MemoryPageContent } from "@/components/linkbrain/memory-page-content";

export const dynamic = "force-dynamic";

export default async function MemoryPage(props: { searchParams: Promise<Parameters<typeof MemoryPageContent>[0]["searchParams"]> }) {
  const searchParams = await props.searchParams;
  return <MemoryPageContent searchParams={searchParams} />;
}
