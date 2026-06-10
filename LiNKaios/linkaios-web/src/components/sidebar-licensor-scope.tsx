"use client";

import { InsetSelect } from "@/components/forms";
import { useLicensorScope } from "@/components/role-preview-provider";
import {
  ADMIN_SCOPE,
  ALL_LICENSEES_SCOPE,
  PLATFORM_ALL_SCOPE,
} from "@/lib/app-roles";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";
import { FIELD, FORM } from "@/lib/ui-standards";

/** Licensor Admin — sidebar View filter (platform / admin / licensees). */
export function SidebarLicensorScope() {
  const { scope, setScope } = useLicensorScope();

  return (
    <div className={FORM.fieldStack}>
      <span className={`${FIELD.label} px-0.5`}>View</span>
      <InsetSelect
        id="sidebar-licensor-scope"
        value={scope}
        aria-label="View"
        onChange={(e) => setScope(e.target.value)}
      >
        <option value={PLATFORM_ALL_SCOPE}>All</option>
        <option value={ADMIN_SCOPE}>Admin</option>
        <option value={ALL_LICENSEES_SCOPE}>All licensees</option>
        {LICENSEE_REGISTRY.map((row) => (
          <option key={row.id} value={row.id}>
            {row.name}
          </option>
        ))}
      </InsetSelect>
    </div>
  );
}
