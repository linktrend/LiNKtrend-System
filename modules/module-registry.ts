/**
 * Module Registry Types
 *
 * Type definitions for tenant-enabled modules.
 *
 * @module modules
 */

/**
 * Module status values
 */
export type ModuleStatus =
  | "active"           // Fully operational
  | "active_mvo"       // Minimum viable offering operational
  | "active_discovery" // Active development/discovery phase
  | "planned"          // Planned but not yet implemented
  | "reserved";        // Reserved for future use

/**
 * Mode support for modules
 */
export type ModuleMode =
  | "development"
  | "shadow"
  | "live";

/**
 * Plane project/task expectations
 */
export interface PlaneExpectations {
  /** Project template identifier */
  projectTemplate: string;
  /** Default task states for this module */
  defaultTaskStates: string[];
}

/**
 * Schema references for documentation
 */
export interface SchemaReferences {
  /** Core identity tables */
  coreTables: string[];
  /** Evidence-related tables */
  evidenceTables?: string[];
  /** Assertion/support tables */
  assertionTables?: string[];
  /** Artifact/output tables */
  artifactTables?: string[];
  /** Workflow/audit tables */
  workflowTables?: string[];
}

/**
 * Module manifest definition
 */
export interface ModuleManifest {
  /** Unique module identifier */
  moduleId: string;
  /** Module version */
  version: string;
  /** Human-readable display name */
  displayName: string;
  /** Module description */
  description: string;
  /** Current status */
  status: ModuleStatus;

  /** Work request types this module handles */
  workRequestTypes: string[];

  /** Workflow stages if applicable */
  workflowStages?: string[];

  /** Required role IDs */
  requiredRoles: string[];

  /** Required capability connectors */
  requiredCapabilities: string[];

  /** Required workflow handles */
  requiredWorkflowHandles: string[];

  /** UI panels provided by this module */
  uiPanels: string[];

  /** Supported modes */
  supportedModes: ModuleMode[];

  /** Default mode */
  defaultMode: ModuleMode;

  /** External source repo if applicable */
  externalRepo?: string;

  /** Dependencies on other modules */
  dependencies: string[];

  /** Plane project/task expectations */
  planeExpectations?: PlaneExpectations;

  /** LiNKbrain audit event categories */
  auditEventCategories?: string[];

  /** Schema references */
  schemaReferences?: SchemaReferences;
}

/**
 * Module registry entry
 */
export interface ModuleRegistryEntry extends ModuleManifest {
  /** Registration timestamp */
  registeredAt: string;
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * Module registry
 */
export type ModuleRegistry = Record<string, ModuleRegistryEntry>;

// Re-export LEXOS litigation manifest
export { LexosLitigationManifest } from "./lexos/litigation/manifest";
