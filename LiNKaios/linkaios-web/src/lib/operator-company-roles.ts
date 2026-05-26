import type { CommandCentreRole } from "@/lib/command-centre-access";
import { COMPANY_FIXTURES } from "@/lib/company-fixtures";

export type OperatorCompanyRole = {
  id: string;
  company: string;
  role: string;
};

function isStudioEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  return normalized.endsWith("@linktrend.media") || normalized.endsWith("@linktrend.com");
}

/** MVO fixture until tenant membership API is wired. */
export function resolveOperatorCompanyRoles(params: {
  email: string;
  role?: CommandCentreRole;
}): OperatorCompanyRole[] {
  const role = params.role ?? "operator";
  const studio = isStudioEmail(params.email);

  if (role === "admin" && studio) {
    const [xyz, acme] = COMPANY_FIXTURES;
    return [
      { id: "linktrend-studio", company: "LiNKtrend", role: "Owner" },
      ...(xyz ? [{ id: xyz.id, company: xyz.displayName, role: "Member" as const }] : []),
      ...(acme ? [{ id: acme.id, company: acme.displayName, role: "Viewer" as const }] : []),
    ];
  }

  if (role === "viewer") {
    return [{ id: "linktrend-studio", company: "LiNKtrend", role: "Viewer" }];
  }

  const client = COMPANY_FIXTURES[0];
  return client
    ? [{ id: client.id, company: client.displayName, role: role === "admin" ? "Admin" : "Member" }]
    : [];
}
