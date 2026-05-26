"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { WorkerLinkskillsSlice } from "@/lib/worker-linkskills-slice";
import { screenTabLinkClass, TABS as SCREEN_TABS } from "@/lib/ui-standards";

const SLICES: { id: WorkerLinkskillsSlice; label: string }[] = [
  { id: "skills", label: "Skills" },
  { id: "connectors", label: "Capabilities" },
  { id: "tools", label: "Tools" },
];

function parseSlice(v: string | null): WorkerLinkskillsSlice {
  if (v === "connectors" || v === "tools") return v;
  return "skills";
}

export function WorkerLinkskillsSubnav(props: { agentId: string }) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const current = parseSlice(searchParams.get("slice"));

  return (
    <nav aria-label="LiNKskills slices" className={SCREEN_TABS.row}>
      {SLICES.map((slice) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slice.id === "skills") {
          params.delete("slice");
        } else {
          params.set("slice", slice.id);
        }
        const qs = params.toString();
        const href = qs ? `${pathname}?${qs}` : pathname;
        const on = current === slice.id;
        return (
          <Link
            key={slice.id}
            href={href}
            prefetch={false}
            aria-current={on ? "page" : undefined}
            className={screenTabLinkClass(on)}
            role="tab"
            aria-selected={on}
          >
            {slice.label}
          </Link>
        );
      })}
    </nav>
  );
}
