"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { screenTabLinkClass, TABS } from "@/lib/ui-standards";
import type { AudienceMode } from "@/lib/ui-mocks/modules-catalog-demo";

type BrowseMode = "module" | "project-type";

function browseFromPath(pathname: string): BrowseMode {
  if (pathname.startsWith("/modules/project-types")) return "project-type";
  return "module";
}

function audienceQuery(audience: AudienceMode): string {
  return audience === "vendor" ? "vendor" : "client";
}

export function ModulesHubNav(props: { browse: BrowseMode; audience: AudienceMode; showAudienceToggle?: boolean }) {
  const pathname = usePathname() ?? "/modules";
  const browse = props.browse ?? browseFromPath(pathname);
  const aud = audienceQuery(props.audience);
  const moduleBase = `/modules?audience=${aud}`;
  const projectTypeBase = `/modules/project-types?audience=${aud}`;

  return (
    <div className={TABS.row}>
      <Link href={moduleBase} className={screenTabLinkClass(browse === "module")}>
        Module catalogue
      </Link>
      <Link href={projectTypeBase} className={screenTabLinkClass(browse === "project-type")}>
        Project type catalogue
      </Link>
      {props.showAudienceToggle ? (
        <>
          <span className="mx-1 hidden text-zinc-300 sm:inline dark:text-zinc-700" aria-hidden>
            |
          </span>
          <Link
            href={browse === "project-type" ? "/modules/project-types?audience=client" : "/modules?audience=client"}
            className={screenTabLinkClass(props.audience === "client")}
          >
            Client view
          </Link>
          <Link
            href={browse === "project-type" ? "/modules/project-types?audience=vendor" : "/modules?audience=vendor"}
            className={screenTabLinkClass(props.audience === "vendor")}
          >
            Vendor view
          </Link>
        </>
      ) : null}
    </div>
  );
}
