import { redirect } from "next/navigation";

import { ADMIN_BASE_PATH } from "@/lib/app-surface";

type SearchParams = Record<string, string | string[] | undefined>;

function toQueryString(searchParams: SearchParams): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((entry) => qs.append(key, entry));
  }
  const serialized = qs.toString();
  return serialized ? `?${serialized}` : "";
}

/** Licensor hub lives under `/admin/licensees` — keep `/licensees` as a stable alias. */
export default async function LicenseesAliasRedirectPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  redirect(`${ADMIN_BASE_PATH}/licensees${toQueryString(searchParams)}`);
}
