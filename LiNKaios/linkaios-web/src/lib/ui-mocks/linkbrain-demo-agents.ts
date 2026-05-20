/** Demo LiNKbot ids for LiNKbrain mock mode — UUIDs required by Postgres brain tables. */
export const DEMO_BRAIN_AGENTS = [
  { slug: "demo-lisa", id: "00000000-0000-4000-8000-00000000a101", display_name: "Lisa (CEO)" },
  { slug: "demo-eric", id: "00000000-0000-4000-8000-00000000a102", display_name: "Eric (CTO)" },
] as const;

export function resolveDemoBrainAgentId(id?: string | null): string | undefined {
  const v = id?.trim();
  if (!v) return undefined;
  const hit = DEMO_BRAIN_AGENTS.find((a) => a.slug === v || a.id === v);
  return hit?.id ?? v;
}

export function demoBrainAgentSlugForId(id?: string | null): string | undefined {
  const v = id?.trim();
  if (!v) return undefined;
  const hit = DEMO_BRAIN_AGENTS.find((a) => a.id === v || a.slug === v);
  return hit?.slug ?? v;
}
