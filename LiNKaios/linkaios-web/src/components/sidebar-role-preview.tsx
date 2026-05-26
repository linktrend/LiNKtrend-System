"use client";

import { InsetSelect } from "@/components/forms";
import { useAppRole } from "@/components/role-preview-provider";
import { APP_ROLE_TIERS, ROLE_TIER_LABELS, type AppRoleTier } from "@/lib/app-roles";

/** Compact role preview dropdown — toolbar placement during UI review. */
export function RolePreviewSelect(props: { className?: string }) {
  const { role, setRole } = useAppRole();

  return (
    <InsetSelect
      id="toolbar-role-preview"
      value={role}
      aria-label="Preview role"
      compact
      className={props.className ?? "min-w-[7.5rem] max-w-[9.5rem]"}
      onChange={(e) => setRole(e.target.value as AppRoleTier)}
    >
      {APP_ROLE_TIERS.map((tier) => (
        <option key={tier} value={tier}>
          {ROLE_TIER_LABELS[tier]}
        </option>
      ))}
    </InsetSelect>
  );
}

export function SidebarRoleBadge() {
  const { role } = useAppRole();
  return (
    <span className="inline-flex shrink-0 rounded-full bg-zinc-200/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {ROLE_TIER_LABELS[role]}
    </span>
  );
}
