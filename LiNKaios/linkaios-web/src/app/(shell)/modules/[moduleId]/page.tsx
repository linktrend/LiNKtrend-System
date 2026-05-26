import { redirect } from "next/navigation";

export default async function LegacyModuleProfileRedirect(props: {
  params: Promise<{ moduleId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { moduleId } = await props.params;
  const sp = await props.searchParams;
  const tab = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const qs = tab ? `?tab=${encodeURIComponent(tab === "processes" ? "modules" : tab)}` : "";
  redirect(`/suites/${moduleId}${qs}`);
}
