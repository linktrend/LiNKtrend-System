/**
 * LiNKbot → LiNKguard session cleanup bridge (LTS-050).
 */

import {
  listSkillTraces,
  registerSkillTrace,
  wipeSkillTracesForSession,
  type SkillTraceEntry,
} from "./seams/skill-trace-wipe.js";

export type BotSessionCleanupResult = {
  session_id: string;
  skill_traces_wiped: number;
  wiped_skill_ids: string[];
};

export function recordBotSkillTrace(entry: SkillTraceEntry): void {
  registerSkillTrace(entry);
}

export function cleanupBotSessionWithLinkguard(session_id: string): BotSessionCleanupResult {
  const before = listSkillTraces(session_id).length;
  const wipe = wipeSkillTracesForSession(session_id);
  return {
    session_id,
    skill_traces_wiped: before > 0 ? wipe.wiped_count : 0,
    wiped_skill_ids: wipe.wiped_skill_ids,
  };
}
