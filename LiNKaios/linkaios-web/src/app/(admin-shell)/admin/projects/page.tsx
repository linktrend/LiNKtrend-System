import { AdminProgramsPage } from "@/components/admin/admin-programs-page";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ blocked?: string }>;

export default async function AdminProgramsListPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const blocked = searchParams.blocked === "create" || searchParams.blocked === "detail" ? searchParams.blocked : null;
  return <AdminProgramsPage blocked={blocked} />;
}
