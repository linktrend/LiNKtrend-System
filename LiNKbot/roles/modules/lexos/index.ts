/**
 * LEXOS Litigation Role Definitions
 *
 * @packageDocumentation
 */

export { lexosIntakeAgentRole } from "./intake-agent";
export { lexosCustodianAgentRole } from "./custodian-agent";
export { lexosStoryArchitectRole } from "./story-architect";
export { lexosEvidenceArchivistRole } from "./evidence-archivist";
export { lexosAnalystRole } from "./analyst";
export { lexosStrategistRole } from "./strategist";
export { lexosLibrarianRole } from "./librarian";
export { lexosAdvocateRole } from "./advocate";
export { lexosAdversaryRole } from "./adversary";
export { lexosRhetoricianRole } from "./rhetorician";

// Role ID constants
export const LEXOS_ROLE_IDS = [
  "lexos_intake_agent",
  "lexos_custodian_agent",
  "lexos_story_architect",
  "lexos_evidence_archivist",
  "lexos_analyst",
  "lexos_strategist",
  "lexos_librarian",
  "lexos_advocate",
  "lexos_adversary",
  "lexos_rhetorician",
] as const;

export type LexosRoleId = (typeof LEXOS_ROLE_IDS)[number];

// Role to stage mapping
export const LEXOS_ROLE_STAGE_MAP: Record<LexosRoleId, string> = {
  lexos_intake_agent: "W0",
  lexos_custodian_agent: "W1",
  lexos_story_architect: "W2",
  lexos_evidence_archivist: "W4",
  lexos_analyst: "W5",
  lexos_strategist: "W6",
  lexos_librarian: "W7",
  lexos_advocate: "W8",
  lexos_adversary: "W9",
  lexos_rhetorician: "W11",
};

// All LEXOS roles export
export const allLexosRoles = [
  lexosIntakeAgentRole,
  lexosCustodianAgentRole,
  lexosStoryArchitectRole,
  lexosEvidenceArchivistRole,
  lexosAnalystRole,
  lexosStrategistRole,
  lexosLibrarianRole,
  lexosAdvocateRole,
  lexosAdversaryRole,
  lexosRhetoricianRole,
];
