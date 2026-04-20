/**
 * Gemini text embeddings for LiNKbrain chunk indexing (server-side only).
 * Uses Generative Language API `text-embedding-004`.
 */

const MODEL = "models/text-embedding-004";

export type GeminiEmbedOk = { embedding: number[]; dimensions: number };
export type GeminiEmbedResult = GeminiEmbedOk | { error: string };

export async function embedTextGemini(text: string, apiKey: string): Promise<GeminiEmbedResult> {
  const trimmed = text.trim();
  if (!trimmed) return { error: "empty text" };
  const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:embedContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      content: { parts: [{ text: trimmed.slice(0, 8_000) }] },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { error: `Gemini embed HTTP ${res.status}: ${t.slice(0, 400)}` };
  }
  const json = (await res.json()) as {
    embedding?: { values?: number[] };
    error?: { message?: string };
  };
  const values = json.embedding?.values;
  if (!values?.length) {
    return { error: json.error?.message ?? "missing embedding.values" };
  }
  return { embedding: values, dimensions: values.length };
}
