/**
 * HTTP Layer 3: fetch full skill execution package from LiNKaios (`POST /api/skills/execution`).
 * Uses service shared secret (`BOT_SKILLS_API_SECRET` or `BOT_BRAIN_API_SECRET` on the server).
 */

export type FetchSkillExecutionResult =
  | { ok: true; data: unknown }
  | { ok: false; status: number; message: string };

export async function fetchSkillExecutionPackageFromLiNKaios(opts: {
  baseUrl: string;
  bearerSecret: string;
  skillName: string;
  version?: number;
  timeoutMs: number;
}): Promise<FetchSkillExecutionResult> {
  const base = opts.baseUrl.replace(/\/$/, "");
  const url = `${base}/api/skills/execution`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), Math.max(1000, opts.timeoutMs));
  try {
    const body: Record<string, unknown> = { name: opts.skillName.trim().toLowerCase() };
    if (typeof opts.version === "number" && Number.isFinite(opts.version)) {
      body.version = opts.version;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.bearerSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, status: res.status, message: text.slice(0, 800) };
    }
    let data: unknown;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { raw: text };
    }
    return { ok: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, message: msg };
  } finally {
    clearTimeout(t);
  }
}
