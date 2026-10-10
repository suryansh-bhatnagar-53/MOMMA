// Minimal Gemini REST client (models.generateContent). Server-side only: called from server
// function handlers, where GEMINI_API_KEY comes from .env.local (never from VITE_* vars).
// Returns null when the key is missing or the call fails, so callers can fall back.

export type ChatTurn = { role: "user" | "assistant"; content: string };

const DEFAULT_MODEL = "gemini-3-flash-preview"; // has a free tier; override with GEMINI_MODEL

export async function geminiGenerate(opts: {
  system: string;
  messages: ChatTurn[];
  json?: boolean;
  schema?: object; // OpenAPI-style responseSchema, used with json
  temperature?: number;
  label: string; // for logs
}): Promise<string | null> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) return null;
  const model = process.env["GEMINI_MODEL"] || DEFAULT_MODEL;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: opts.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: {
          ...(opts.temperature !== undefined && { temperature: opts.temperature }),
          ...(opts.json && { responseMimeType: "application/json", ...(opts.schema && { responseSchema: opts.schema }) }),
        },
      }),
    });
    if (!res.ok) {
      // 429 = free-tier rate limit; 400/403 = bad key or model name.
      console.error(`${opts.label}: Gemini ${res.status}`, (await res.text()).slice(0, 500));
      return null;
    }
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    return text.trim() || null;
  } catch (e) {
    console.error(`${opts.label}: Gemini call failed`, e);
    return null;
  }
}
