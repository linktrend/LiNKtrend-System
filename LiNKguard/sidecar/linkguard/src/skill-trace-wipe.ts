/**
 * LiNKguard skill trace wipe after bot run (LTS-050).
 * Progressive disclosure: skill content must not persist on the worker after completion.
 */

export type SkillTraceEntry = {
  session_id: string;
  skill_id: string;
  skill_name: string;
  step_id?: string;
  captured_at: string;
  trace_digest: string;
};

export type SkillTraceWipeResult = {
  session_id: string;
  wiped_count: number;
  wiped_skill_ids: string[];
  wiped_at: string;
};

const tracesBySession = new Map<string, SkillTraceEntry[]>();
const wipeAuditLog: SkillTraceWipeResult[] = [];

export function clearSkillTraceStores(): void {
  tracesBySession.clear();
  wipeAuditLog.length = 0;
}

export function registerSkillTrace(entry: SkillTraceEntry): void {
  const list = tracesBySession.get(entry.session_id) ?? [];
  list.push(entry);
  tracesBySession.set(entry.session_id, list);
}

export function listSkillTraces(session_id: string): SkillTraceEntry[] {
  return (tracesBySession.get(session_id) ?? []).slice();
}

export function wipeSkillTracesForSession(
  session_id: string,
  now: string = new Date().toISOString(),
): SkillTraceWipeResult {
  const entries = tracesBySession.get(session_id) ?? [];
  const wiped_skill_ids = [...new Set(entries.map((e) => e.skill_id))];
  tracesBySession.delete(session_id);

  const result: SkillTraceWipeResult = {
    session_id,
    wiped_count: entries.length,
    wiped_skill_ids,
    wiped_at: now,
  };
  wipeAuditLog.push(result);
  return result;
}

export function getSkillTraceWipeAuditLog(): SkillTraceWipeResult[] {
  return wipeAuditLog.slice();
}
