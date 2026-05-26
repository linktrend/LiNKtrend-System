import type { LinkbrainTab } from "@/lib/linkbrain-data";
import { LICENSEE_QUERY_KEYS } from "@/lib/licensee-context";

/** Build `/memory` URLs (safe on server and client; no React hooks). */
export function memoryHref(
  tab: LinkbrainTab,
  o: {
    companyId?: string;
    brandId?: string;
    mission?: string;
    classification?: string;
    agent?: string;
    scope?: "recent" | "all";
    brainScope?: string;
    brainMission?: string;
    brainAgent?: string;
    org?: string;
    inboxItem?: string;
    inboxSource?: string;
    inboxSort?: string;
    bKind?: string;
    cIndustry?: string;
    cPattern?: string;
    cUseCase?: string;
    cSubmission?: string;
  },
): string {
  const p = new URLSearchParams();
  p.set("tab", tab);
  if (o.companyId?.trim()) p.set(LICENSEE_QUERY_KEYS.companyId, o.companyId.trim());
  if (o.brandId?.trim()) p.set(LICENSEE_QUERY_KEYS.brandId, o.brandId.trim());
  if (o.mission?.trim()) p.set("mission", o.mission.trim());
  if (o.classification?.trim()) p.set("classification", o.classification.trim());
  if (o.agent?.trim()) p.set("agent", o.agent.trim());
  if (o.scope === "all") p.set("scope", "all");
  if (o.brainScope && o.brainScope !== "company") p.set("b_scope", o.brainScope);
  if (o.brainMission?.trim()) p.set("b_mission", o.brainMission.trim());
  if (o.brainAgent?.trim()) p.set("b_agent", o.brainAgent.trim());
  if (o.org?.trim()) p.set("org", o.org.trim());
  if (o.inboxItem?.trim()) p.set("inbox_item", o.inboxItem.trim());
  if (o.inboxSource?.trim()) p.set("inbox_source", o.inboxSource.trim());
  if (o.inboxSort === "asc") p.set("inbox_sort", "asc");
  if (o.bKind?.trim()) p.set("b_kind", o.bKind.trim());
  if (o.cIndustry?.trim()) p.set("c_industry", o.cIndustry.trim());
  if (o.cPattern?.trim()) p.set("c_pattern", o.cPattern.trim());
  if (o.cUseCase?.trim()) p.set("c_use_case", o.cUseCase.trim());
  if (o.cSubmission?.trim()) p.set("c_submission", o.cSubmission.trim());
  return `/memory?${p.toString()}`;
}
