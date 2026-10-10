// Minimal Groq client (OpenAI-compatible /chat/completions). Server-side only:
// GROQ_API_KEY and GROQ_MODEL come from .env.local (never from VITE_* vars).
// Same contract as geminiGenerate: returns null when unconfigured, too large, or failed,
// so the llm.ts router can fall back (e.g. to Gemini for big requests).

import type { ChatTurn } from "./gemini";

const BASE_URL = "https://api.groq.com/openai/v1";

export async function groqGenerate(opts: {
  system: string;
  messages: ChatTurn[];
  json?: boolean;
  schema?: object; // sent as text in the prompt; Groq's JSON mode guarantees valid JSON, not this shape
  temperature?: number;
  label: string; // for logs
}): Promise<string | null> {
  const key = process.env["GROQ_API_KEY"];
  const model = process.env["GROQ_MODEL"]; // copy the exact id from Groq's models page
  if (!key || !model) return null;

  const system = opts.json
    ? `${opts.system}\n\nRespond with a single valid JSON object only.` +
      (opts.schema ? `\nThe JSON must match this schema:\n${JSON.stringify(opts.schema)}` : "")
    : opts.system;

  // Free-tier tokens-per-minute limits can be smaller than one big request. Skip early
  // instead of spending a rejected call. Rough estimate: ~4 characters per token.
  const maxInput = Number(process.env["GROQ_MAX_INPUT_TOKENS"] || 6000);
  const estimated = Math.ceil((system.length + opts.messages.reduce((n, m) => n + m.content.length, 0)) / 4);
  if (estimated > maxInput) {
    console.warn(`${opts.label}: Groq skipped, ~${estimated} input tokens > GROQ_MAX_INPUT_TOKENS=${maxInput}`);
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: opts.temperature ?? (opts.json ? 0.2 : 0.6),
        max_tokens: Number(process.env["GROQ_MAX_TOKENS"] || 2048),
        // Groq JSON mode (valid JSON guaranteed; the prompt must mention JSON, which it does above).
        // Not every model supports it: set GROQ_JSON_MODE=false if you get a 400.
        ...(opts.json && process.env["GROQ_JSON_MODE"] !== "false" && { response_format: { type: "json_object" } }),
      }),
    });
    if (!res.ok) {
      // 401 = bad key; 404 = wrong model id; 413 = request too large for your plan; 429 = rate limited.
      const retryAfter = res.headers.get("retry-after");
      console.error(
        `${opts.label}: Groq ${res.status}${retryAfter ? ` (retry after ${retryAfter}s)` : ""}`,
        (await res.text()).slice(0, 500),
      );
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    if (data.usage) {
      console.info(`${opts.label}: Groq tokens in=${data.usage.prompt_tokens} out=${data.usage.completion_tokens}`);
    }
    let text = (data.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    if (opts.json) text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    return text || null;
  } catch (e) {
    console.error(`${opts.label}: Groq call failed`, e);
    return null;
  }
}
