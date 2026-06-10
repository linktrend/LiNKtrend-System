/** LiNKguard cleanup_events actions that indicate successful cleanup work (not heartbeats or failures). */
export const LINKGUARD_SUCCESS_ACTIONS = [
  "residue_sweep_ack",
  "bot_session_cleanup",
  "manual_cleanup_run",
] as const;

export type LinkguardSuccessAction = (typeof LINKGUARD_SUCCESS_ACTIONS)[number];
