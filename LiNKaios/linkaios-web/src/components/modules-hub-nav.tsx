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

export function ModulesHubNav(props: {
  browse: BrowseMode;
  audience: AudienceMode;
  moduleId?: string;
  projectTypeId?: string;
  showAudienceToggle?: boolean;
}) {
  const pathname = usePathname() ?? "/modules";
  const browse = props.browse ?? browseFromPath(pathname);
  const aud = audienceQuery(props.audience);
  const moduleHref = props.moduleId ? `/modules/${props.moduleId}?audience=${aud}` : `/modules?audience=${aud}`;
  const projectTypeHref = props.projectTypeId
    ? `/modules/project-types/${props.projectTypeId}?audience=${aud}`
    : `/modules/project-types?audience=${aud}`;

  return (
    <div className={TABS.row}>
      <Link href={moduleHref} className={screenTabLinkClass(browse === "module")}>
        Module catalogue
      </Link>
      <Link href={projectTypeHref} className={screenTabLinkClass(browse === "project-type")}>
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
