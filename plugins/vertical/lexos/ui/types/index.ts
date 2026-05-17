/**
 * LEXOS UI Type Definitions
 *
 * TypeScript type definitions for the LEXOS litigation vertical plugin UI.
 */

// =============================================================================
// Stage Identifiers (W0-W11)
// =============================================================================

/**
 * LEXOS workflow stage identifiers
 *
 * W0: Client Onboarding
 * W1: Client Master Record
 * W2: Case-Client Story
 * W3: Opposing File Reconciliation (deferred in MVO)
 * W4: Evidence Intake
 * W5: Support Matrix
 * W6: Strategy Development
 * W7: Legal Research
 * W8: Argument Drafting
 * W9: Adversarial Review
 * W10: Visual Exhibits (deferred in MVO)
 * W11: Output Refinement
 */
export type LexosStageId =
  | 'W0'
  | 'W1'
  | 'W2'
  | 'W3'
  | 'W4'
  | 'W5'
  | 'W6'
  | 'W7'
  | 'W8'
  | 'W9'
  | 'W10'
  | 'W11';

/**
 * LEXOS UI panel identifiers
 */
export type LexosPanelId =
  | 'overview'
  | 'story'
  | 'evidence'
  | 'assertions'
  | 'strategy'
  | 'research'
  | 'argument'
  | 'adversarial'
  | 'output'
  | 'intake'
  | 'intake_list'
  | 'clients'
  | 'client_detail';

// =============================================================================
// Matter and Client References
// =============================================================================

/**
 * Matter reference type
 */
export interface MatterRef {
  /** Unique matter identifier */
  matter_id: string;
  /** Matter display name/title */
  matter_name: string;
  /** Associated client identifier */
  client_id: string;
  /** Matter status */
  status: MatterStatus;
  /** Current workflow stage */
  current_stage: LexosStageId;
  /** Tenant identifier for isolation */
  tenant_id: string;
}

/**
 * Matter status values
 */
export type MatterStatus =
  | 'intake'
  | 'active'
  | 'pending'
  | 'on_hold'
  | 'closed'
  | 'archived';

/**
 * Client reference type
 */
export interface ClientRef {
  /** Unique client identifier */
  client_id: string;
  /** Client display name */
  client_name: string;
  /** Primary contact email */
  email?: string;
  /** Client status */
  status: ClientStatus;
  /** Tenant identifier for isolation */
  tenant_id: string;
}

/**
 * Client status values
 */
export type ClientStatus = 'prospect' | 'active' | 'inactive' | 'archived';

/**
 * Intake record reference type
 */
export interface IntakeRef {
  /** Unique intake identifier */
  intake_id: string;
  /** Intake record status */
  status: IntakeStatus;
  /** Proposed client name */
  proposed_client_name: string;
  /** Proposed matter description */
  proposed_matter_description: string;
  /** Conflict check status */
  conflict_status: ConflictStatus;
  /** Tenant identifier for isolation */
  tenant_id: string;
}

/**
 * Intake status values
 */
export type IntakeStatus =
  | 'pending'
  | 'under_review'
  | 'conflict_checking'
  | 'approved'
  | 'rejected'
  | 'converted';

/**
 * Conflict check status values
 */
export type ConflictStatus =
  | 'not_checked'
  | 'checking'
  | 'clear'
  | 'potential'
  | 'conflict';

// =============================================================================
// Workspace Panel Props
// =============================================================================

/**
 * Base props for matter-specific workspace panels
 */
export interface MatterPanelProps {
  /** Matter identifier */
  matterId: string;
}

/**
 * Base props for intake-specific workspace panels
 */
export interface IntakePanelProps {
  /** Intake record identifier */
  intakeId: string;
}

/**
 * Base props for client-specific workspace panels
 */
export interface ClientPanelProps {
  /** Client identifier */
  clientId: string;
}

// =============================================================================
// Navigation Types
// =============================================================================

/**
 * Navigation item for matter subnav
 */
export interface MatterNavItem {
  /** Panel identifier */
  id: LexosPanelId;
  /** Display label */
  label: string;
  /** Route href pattern */
  href: string;
  /** Associated workflow stage */
  stage: LexosStageId;
  /** Description for tooltip */
  description: string;
}

/**
 * Breadcrumb item type
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Optional href for navigation */
  href?: string;
}

// =============================================================================
// Workspace Container Props
// =============================================================================

/**
 * Props for workspace container component
 */
export interface WorkspaceContainerProps {
  /** Child content */
  children: React.ReactNode;
  /** Workspace title */
  title: string;
  /** Optional workflow stage identifier */
  stage?: LexosStageId;
  /** Optional description text */
  description?: string;
  /** Optional header actions */
  actions?: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// App Shell Props
// =============================================================================

/**
 * Props for LEXOS application shell
 */
export interface LexosAppShellProps {
  /** Child content to render in main area */
  children: React.ReactNode;
  /** Optional matter ID for matter-specific navigation */
  matterId?: string;
  /** Optional active panel identifier */
  activePanel?: LexosPanelId;
  /** Optional breadcrumb items */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional page title */
  title?: string;
  /** Optional header actions */
  actions?: React.ReactNode;
}

// =============================================================================
// Re-export for convenience
// =============================================================================

export type { BreadcrumbItem as BreadcrumbItemType } from '../layouts/Breadcrumbs';
