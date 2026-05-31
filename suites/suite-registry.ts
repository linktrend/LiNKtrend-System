/**
 * Suite Registry Types
 *
 * Type definitions for tenant-enabled suites (product packages).
 *
 * @module suites
 */

/**
 * Suite status values
 */
export type SuiteStatus =
  | "active"
  | "active_mvo"
  | "active_discovery"
  | "planned"
  | "reserved";

/** @deprecated Use SuiteStatus */
export type ModuleStatus = SuiteStatus;

/**
 * Mode support for suites
 */
export type SuiteMode =
  | "development"
  | "shadow"
  | "live";

/** @deprecated Use SuiteMode */
export type ModuleMode = SuiteMode;

/**
 * Plane project/task expectations
 */
export interface PlaneExpectations {
  projectTemplate: string;
  defaultTaskStates: string[];
}

/**
 * Schema references for documentation
 */
export interface SchemaReferences {
  coreTables: string[];
  evidenceTables?: string[];
  assertionTables?: string[];
  artifactTables?: string[];
  workflowTables?: string[];
}

/**
 * Suite manifest definition (top-level product / suite package)
 */
export interface SuiteManifest {
  /** Unique suite identifier */
  suiteId: string;
  version: string;
  displayName: string;
  description: string;
  status: SuiteStatus;
  workRequestTypes: string[];
  workflowStages?: string[];
  requiredRoles: string[];
  requiredCapabilities: string[];
  requiredWorkflowHandles: string[];
  uiPanels: string[];
  supportedModes: SuiteMode[];
  defaultMode: SuiteMode;
  externalRepo?: string;
  dependencies: string[];
  planeExpectations?: PlaneExpectations;
  auditEventCategories?: string[];
  schemaReferences?: SchemaReferences;
}

/**
 * @deprecated Use SuiteManifest and `suiteId`.
 */
export type ModuleManifest = SuiteManifest & {
  /** @deprecated Use suiteId */
  moduleId?: string;
};

/**
 * Suite registry entry
 */
export interface SuiteRegistryEntry extends SuiteManifest {
  registeredAt: string;
  updatedAt: string;
}

/** @deprecated Use SuiteRegistryEntry */
export type ModuleRegistryEntry = SuiteRegistryEntry;

/** @deprecated Use SuiteRegistry */
export type ModuleRegistry = SuiteRegistry;

export type SuiteRegistry = Record<string, SuiteRegistryEntry>;

export { LexosLitigationManifest } from "./lexos/litigation/manifest";
