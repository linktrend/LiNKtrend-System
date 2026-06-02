"use client";

import { useRouter } from "next/navigation";

import { InsetSelect } from "@/components/forms";
import { useAppSurface } from "@/components/app-surface-provider";
import { ADMIN_BASE_PATH, LICENSEE_HOME_PATH } from "@/lib/app-surface";

/** Switch between licensee workspace and licensor admin — toolbar placement. */
export function AppSurfaceSwitch(props: { className?: string }) {
  const { isAdmin } = useAppSurface();
  const router = useRouter();

  return (
    <InsetSelect
      id="toolbar-app-surface"
      value={isAdmin ? "admin" : "licensee"}
      aria-label="Workspace"
      compact
      className={props.className ?? "min-w-[6.5rem] max-w-[8.5rem]"}
      onChange={(e) => {
        const next = e.target.value === "admin" ? ADMIN_BASE_PATH : LICENSEE_HOME_PATH;
        router.push(next);
      }}
    >
      <option value="licensee">Client</option>
      <option value="admin">Admin</option>
    </InsetSelect>
  );
}
