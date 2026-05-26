import { MemoryPageContent } from "@/components/linkbrain/memory-page-content";

export { dynamic } from "@/app/(shell)/memory/page";

export default async function AdminMemoryPage(props: {
  searchParams: Promise<Parameters<typeof MemoryPageContent>[0]["searchParams"]>;
}) {
  const searchParams = await props.searchParams;
  return <MemoryPageContent licensorCollective searchParams={searchParams} />;
}
