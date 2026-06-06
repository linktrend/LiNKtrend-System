/**
 * Platform librarian: `librarian_bot` → `az-librarian` (STUDIO_FORWARD_PLAN §4.4).
 *
 * Replaces legacy OpenClaw `librarian` profile (Wave 6.7 proof target).
 */

import { FLEET_V1_AGENT_ZERO_LANES } from "../agent-zero-lanes.js";

export const PLATFORM_LIBRARIAN_ROLE_ID = "librarian_bot" as const;

export const PLATFORM_LIBRARIAN_AGENT_ZERO_LANE = FLEET_V1_AGENT_ZERO_LANES.LIBRARIAN;

export const PLATFORM_LIBRARIAN_ROLE_TO_AGENT_ZERO_LANE: Record<
  typeof PLATFORM_LIBRARIAN_ROLE_ID,
  string
> = {
  [PLATFORM_LIBRARIAN_ROLE_ID]: PLATFORM_LIBRARIAN_AGENT_ZERO_LANE,
};

/** Resolve Agent Zero lane for platform librarian role. */
export function agentZeroLaneForPlatformLibrarianRole(roleId: string): string | null {
  return PLATFORM_LIBRARIAN_ROLE_TO_AGENT_ZERO_LANE[
    roleId as typeof PLATFORM_LIBRARIAN_ROLE_ID
  ] ?? null;
}
