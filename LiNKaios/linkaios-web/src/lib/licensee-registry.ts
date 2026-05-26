/** Demo licensee tenants for licensor Admin scope selector (wire to tenant registry). */

export type LicenseeRegistryRow = {
  id: string;
  name: string;
  plan: string;
  status: "active" | "trialing" | "suspended";
  entityCount: number;
  brandCount: number;
  suiteCount: number;
  openIssues: number;
};

export const LICENSEE_REGISTRY: LicenseeRegistryRow[] = [
  {
    id: "xyz-marketing",
    name: "XYZ Marketing Group",
    plan: "LiNKaios Business",
    status: "active",
    entityCount: 2,
    brandCount: 4,
    suiteCount: 3,
    openIssues: 1,
  },
  {
    id: "lexos-legal",
    name: "LEXOS Legal LLP",
    plan: "LiNKaios Professional",
    status: "active",
    entityCount: 1,
    brandCount: 1,
    suiteCount: 2,
    openIssues: 0,
  },
  {
    id: "harbor-dental",
    name: "Harbor Dental Co-op",
    plan: "LiNKaios Starter",
    status: "trialing",
    entityCount: 1,
    brandCount: 2,
    suiteCount: 1,
    openIssues: 2,
  },
];

export function resolveLicenseeRegistry(id: string): LicenseeRegistryRow | undefined {
  return LICENSEE_REGISTRY.find((row) => row.id === id);
}
