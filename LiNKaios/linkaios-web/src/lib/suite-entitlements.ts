/**
 * Suite commercial entitlements — which organisational object a suite subscription attaches to.
 * LiNKaios platform fee is separate; suites ship modules, phases, issues, and executors
 * (LiNKbrain / LinkSkills / LiNKautowork usage inside the suite).
 */

export type SuiteEntitlementScope = "licensee" | "legal_entity" | "brand";

export type SuiteEntitlementDefinition = {
  moduleId: string;
  scope: SuiteEntitlementScope;
  label: string;
};

export const SUITE_ENTITLEMENTS: SuiteEntitlementDefinition[] = [
  { moduleId: "linksites", scope: "brand", label: "Per brand (sites & campaigns)" },
  { moduleId: "linkapps", scope: "legal_entity", label: "Per legal entity" },
  { moduleId: "lexos", scope: "legal_entity", label: "Per legal entity" },
  { moduleId: "accounting", scope: "legal_entity", label: "Per legal entity" },
  { moduleId: "marketing", scope: "brand", label: "Per brand" },
];

export function suiteEntitlementForModule(moduleId: string): SuiteEntitlementDefinition {
  return (
    SUITE_ENTITLEMENTS.find((s) => s.moduleId === moduleId) ?? {
      moduleId,
      scope: "legal_entity",
      label: "Per legal entity",
    }
  );
}

export function suiteEntitlementScopeLabel(scope: SuiteEntitlementScope): string {
  switch (scope) {
    case "licensee":
      return "Licensee-wide";
    case "legal_entity":
      return "Per company (legal entity)";
    case "brand":
      return "Per brand";
  }
}
